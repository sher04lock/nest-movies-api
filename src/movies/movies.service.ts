import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { Cache } from 'cache-manager';
import { logger } from '../common/logger/LoggerProvider';
import { OmdbApiClientService } from '../omdb-api-client/omdb-api-client.service';
import { IMovieRating, MovieRatingsRepository } from '../repositories/MovieRatingsRepository';
import { IS3ObjectParams, MovieRepository } from '../repositories/MovieRepository';
import { MovieViewsRepository } from '../repositories/MovieViewsRepository';
import { IQueryParams } from '../repositories/Repository';
import ytdl = require('ytdl-core');
import request = require('request');

interface IGetS3StreamParams {
    s3ObjectParams: IS3ObjectParams;
    range: string;
    headersListener: (statusCode: number, headers: { [key: string]: string; }) => void;
}

interface IS3VideoSource {
    source: 's3';
    s3ObjectParams: IS3ObjectParams;
}

interface IYTVideoSource {
    source: 'yt';
    youtube_id: string;
}

@Injectable()
export class MoviesService {

    private readonly s3 = new S3({ region: "eu-west-1" });

    constructor(
        private readonly repository: MovieRepository,
        private readonly ratingsRepository: MovieRatingsRepository,
        private readonly viewsRepository: MovieViewsRepository,
        private readonly omdbApiClient: OmdbApiClientService,
        @Inject('MEMORY_CACHE_PROVIDER') private readonly memoryCache: Cache,
    ) { }

    public async getMovie(id: number) {
        const movie = await this.repository.findOne({ movie_id: id });

        if (!movie) {
            throw new NotFoundException(`movie with id ${id} not found`);
        }

        const imdbDetails = await this.getImdbDetails(movie.imdb_id);

        return {
            ...movie,
            details: imdbDetails,
        };
    }

    public async getMostViewedMovies(params: IQueryParams) {

        const movies: Array<IMovieRating & { imdb_id?: string, poster?: string }> = await this.ratingsRepository.getMostRatedMovies(params);

        for (const movie of movies) {
            const details = await this.getImdbDetails(movie.imdb_id);
            movie.poster = details.Poster;
        }

        return movies;
    }

    public async getVideoSource(id: number): Promise<IS3VideoSource | IYTVideoSource> {
        const movie = await this.repository.findOne(
            { movie_id: id },
            { projection: { youtube_id: 1, s3: 1 } });

        const { s3: s3ObjectParams, youtube_id } = movie;

        if (s3ObjectParams) {
            return {
                source: 's3',
                s3ObjectParams,
            };
        }

        return {
            source: 'yt',
            youtube_id,
        };
    }

    public async getS3Stream({ s3ObjectParams, range, headersListener }: IGetS3StreamParams) {
        const s3Request = this.s3.getObject({
            Bucket: s3ObjectParams.bucket,
            Key: s3ObjectParams.key,
            Range: range,
        });

        return s3Request
            .on("httpHeaders", headersListener)
            .createReadStream();
    }

    public async getYTStream(youtubeId: string) {
        const url = `http://www.youtube.com/watch?v=${youtubeId}`;

        const videoFormat = await this.memoryCache.wrap(url, async () => {

            const ytVideoInfo = await ytdl.getBasicInfo(url);

            const [format] = ytVideoInfo.formats.filter(x => x.type && x.type.includes('video/mp4'));

            return format;
        }, { ttl: 1000 });

        return request({ url: videoFormat.url, method: "GET" });
    }

    public async getImdbDetails(imdbId: string) {
        try {
            return this.omdbApiClient.getMovieDetails(imdbId);
        } catch (err) {
            logger.error(err);
        }
    }

    public async getMovieViews(id: number) {
        return this.viewsRepository.getMovieViews(id);
    }

    public async incrementMovieViewsCount(movieId: number, userId: number | null) {
        return this.viewsRepository.incrementViewCount(movieId, userId);
    }
}

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { Cache } from 'cache-manager';
import { logger } from '../common/logger/LoggerProvider';
import { OmdbApiClientService, IOmdbMovieDetails } from '../omdb-api-client/omdb-api-client.service';
import { IMovieRating, MovieRatingsRepository } from '../repositories/MovieRatingsRepository';
import { IS3ObjectParams, MovieRepository, IMovieDocument } from '../repositories/MovieRepository';
import { MovieViewsRepository } from '../repositories/MovieViewsRepository';
import { IQueryParams } from '../repositories/Repository';
import ytdl = require('ytdl-core');
import request = require('request');
import { MEMORY_CACHE_PROVIDER } from '../common/providers/constants';
import { IUserDocument } from '../repositories/UserRepository';
import { ObjectId } from 'mongodb';

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

export interface ITimeUpdate {
    movieId: number;
    currentTime: number;
    userId: string;
}


export class Movie implements IMovie {
    id: number;
    poster: string;
    plot: string;
    votes: string;
    _id: ObjectId;
    movie_id: number;
    title: string;
    genres: string[];
    genresString: string;
    year: string;
    avgRating?: number;
    youtube_id: string;
    imdb_id: string;
    s3?: IS3ObjectParams;
    hidden?: boolean;

    constructor(movieDocument: Partial<IMovieDocument>, omdbDetails: IOmdbMovieDetails) {
        Object.assign(this, movieDocument);
        this.poster = omdbDetails.Poster;
        this.plot = omdbDetails.Plot;
        this.votes = omdbDetails.imdbVotes;
        this.id = this.movie_id;
    }
}

export interface IMovie extends IMovieDocument {
    id: number;
    poster: string;
    plot: string;
    votes: string;
}

@Injectable()
export class MoviesService {

    private readonly s3 = new S3({ region: "eu-west-1" });

    constructor(
        private readonly repository: MovieRepository,
        private readonly ratingsRepository: MovieRatingsRepository,
        private readonly viewsRepository: MovieViewsRepository,
        private readonly omdbApiClient: OmdbApiClientService,
        @Inject(MEMORY_CACHE_PROVIDER) private readonly memoryCache: Cache,
    ) { }

    public async getMovie(id: number, { user }: { user?: IUserDocument } = {}) {
        const movieDocument = await this.repository.findOne(
            { movie_id: id, hidden: { $ne: true } },
            {},
            { useCache: true, key: `movie:${id}` }
        );

        if (!movieDocument) {
            throw new NotFoundException(`movie with id ${id} not found`);
        }

        const [userRating, [movie]] = await Promise.all([
            this.getUserRating(user, movieDocument.movie_id),
            this.fillMoviesDetails([movieDocument]),
        ]);

        return {
            ...movie,
            userRating: userRating?.rating,
            user,
        };
    }

    public async queryOdata({ filter, skip, sort, limit }) {
        const cursor = await this.repository.getFindCursor(filter);

        const count = await cursor.count();

        if (skip) {
            cursor.skip(skip);
        }

        if (sort) {
            cursor.sort(sort);
        }

        if (limit) {
            cursor.limit(limit);
        }

        cursor.project({ _id: 0 });

        const result = await cursor.toArray();

        return { "@odata.count": count, value: result };
    }

    public async getMostRatedMovies(params: IQueryParams) {
        const movies: Array<IMovieRating & { imdb_id: string }> = await this.ratingsRepository.getMostRatedMovies(params);

        return this.fillMoviesDetails(movies);
    }


    public async getLastViewedMovies(user: IUserDocument) {
        if (!user) {
            return [];
        }

        const lastViewedMovies = await this.viewsRepository.getLastViewedMovies(user._id.toHexString());

        return this.fillMoviesDetails(lastViewedMovies);
    }

    public async getSavedMovies(user: IUserDocument) {
        const savedMovies = user?.savedForLater || [];
        let movies = await this.repository.find({ movie_id: { $in: savedMovies } }, { projection: { _id: 0, movie_id: 1, imdb_id: 1, title: 1 } });

        return this.fillMoviesDetails(movies);
    }

    public async getUserRating(user: IUserDocument, movie_id: number) {
        if (!user) {
            return {} as IMovieRating;
        }

        return this.ratingsRepository.findOne({ movie_id, user_id: user._id.toHexString() }, { projection: { rating: 1 } })
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

    public async getImdbDetails(imdbId: string): Promise<IOmdbMovieDetails> {
        try {
            return this.omdbApiClient.getMovieDetails(imdbId);
        } catch (err) {
            logger.error(err);
            return {} as IOmdbMovieDetails;
        }
    }

    protected async fillMoviesDetails(movies: Pick<IMovieDocument, "imdb_id">[]): Promise<IMovie[]> {
        const moviesWithDetails = movies.map(async movie => {
            const details = await this.getImdbDetails(movie.imdb_id);
            return new Movie(movie, details);
        });

        return Promise.all(moviesWithDetails);
    }

    public async getMovieViews(id: number) {
        return this.viewsRepository.getMovieViews(id);
    }

    public async incrementMovieViewsCount(movieId: number, userId: number | string | null) {
        if (!await this.repository.count({ movie_id: movieId })) {
            return;
        }
        // Don't set view cound for nonexisting movie.
        return this.viewsRepository.incrementViewCount(movieId, userId);
    }

    public async changeMovieVisibility(movieId: number, hidden: boolean) {
        await this.repository.updateOne({ movie_id: movieId }, { $set: { hidden } });
        await this.ratingsRepository.clearCache();
    }

    public async rateMovie(movieRating: Pick<IMovieRating, 'movie_id' | 'user_id' | 'rating'>) {
        const { movie_id, user_id, rating } = movieRating;

        const { title, genresString } = await this.getMovie(movie_id);

        await this.ratingsRepository.updateOne({ movie_id, user_id }, {
            $set: {
                movie_id,
                user_id,
                rating,
                title,
                genre: genresString
            }
        }, { upsert: true });
    }

    public async searchMovie(term: string, params: IQueryParams) {
        const movies = await this.repository.search(term, params)

        return this.fillMoviesDetails(movies);
    }
}

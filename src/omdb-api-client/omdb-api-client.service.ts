import { HttpService, Injectable } from '@nestjs/common';
import { Cacheable } from '../common/cache/cacheable';
import { logger } from '../common/logger/LoggerProvider';
import { ConfigService } from '../common/config/config.service';
import { Cache } from '../common/cache/cache.decorator';
import { MONTH } from '../common/cache/constants';

export interface IOmdbMovieDetails {
    Title: string;
    Year: string;
    Rated: string;
    Released: string;
    Runtime: string;
    Genre: string;
    Director: string;
    Writer: string;
    Actors: string;
    Plot: string;
    Language: string;
    Country: string;
    Awards: string;
    Poster: string;
    Ratings: IOmdbRatings[];
    Metascore: string;
    imdbRating: string;
    imdbVotes: string;
    imdbID: string;
    Type: string;
    DVD: string;
    BoxOffice: string;
    Production: string;
    Website: string;
    Response: string;
}

export interface IOmdbRatings {
    Source: string;
    Value: string;
}

@Injectable()
export class OmdbApiClientService extends Cacheable {
    private readonly API_URL: string;
    private readonly apiKey: string;

    constructor(
        private readonly config: ConfigService,
        private readonly httpClient: HttpService,

    ) {
        super();
        const { url, apiKey } = config.omdbApiInfo;
        this.API_URL = url;
        this.apiKey = apiKey;
    }

    @Cache({
        keyPrefix: 'omdb.',
        useFirstParamAsKey: true,
        ttl: 2 * MONTH,
    })
    public async getMovieDetails(imdbId: string): Promise<IOmdbMovieDetails> {
        try {
            // return this.cache.wrap(imdbId, async () => {
            logger.debug(`[${this.constructor.name}] calling OMDB API`);
            const params = {
                apiKey: this.apiKey,
                i: imdbId,
            };

            const { data, statusText } = await this.httpClient
                .get(this.API_URL, { params })
                .toPromise();

            logger.debug(`[${this.constructor.name}] OMDB API response: ${statusText}`);

            return data;
            // });

        } catch (err) {
            logger.error(`${this.constructor.name}.getMovieDetails error`, err);
            throw err;
        }
    }
}

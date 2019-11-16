import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { MovieRepository } from '../repositories/MovieRepository';
import { MovieRatingsRepository } from '../repositories/MovieRatingsRepository';
import { OmdbApiClientService } from '../omdb-api-client/omdb-api-client.service';

@Module({
    controllers: [
        MoviesController,
    ],
    providers: [
        MoviesService,
        MovieRepository,
        MovieRatingsRepository,
        OmdbApiClientService,
    ],
    exports: [
        MoviesService,
    ],
})
export class MoviesModule {}

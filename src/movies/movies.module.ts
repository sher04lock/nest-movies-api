import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { MovieRepository } from '../repositories/MovieRepository';
import { MovieRatingsRepository } from '../repositories/MovieRatingsRepository';
import { OmdbApiClientService } from '../omdb-api-client/omdb-api-client.service';
import { MovieViewsRepository } from '../repositories/MovieViewsRepository';
import { UpdateViewsMiddleware } from './updateViews.middleware';

@Module({
    controllers: [
        MoviesController,
    ],
    providers: [
        MoviesService,
        MovieRepository,
        MovieRatingsRepository,
        MovieViewsRepository,
        OmdbApiClientService,
    ],
    exports: [
        MoviesService,
    ],
})
export class MoviesModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(UpdateViewsMiddleware)
            .forRoutes({ path: '/movies/:id', method: RequestMethod.GET });
    }
}

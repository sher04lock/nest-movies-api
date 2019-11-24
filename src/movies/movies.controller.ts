import { Controller, Get, Param, ParseIntPipe, Req, Headers, Res, Query, Put, Post, Body, UseGuards } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Request, Response } from 'express';
import { DefaultsTo } from '../common/pipes/defaults-to.pipe';
import { logger } from '../common/logger/LoggerProvider';
import { IMovieRating } from '../repositories/MovieRatingsRepository';
import { AuthGuard } from '@nestjs/passport';

@Controller('movies')
export class MoviesController {

    constructor(private readonly moviesService: MoviesService) { }

    @Get('/')
    public getMostRatedMovies(
        @Query('skip', new DefaultsTo(0), new ParseIntPipe()) skip: number,
        @Query('limit', new DefaultsTo(100), new ParseIntPipe()) limit: number,
    ) {
        return this.moviesService.getMostRatedMovies({ skip, limit });
    }

    @Get('/last-viewed')
    public getLastViewedMovies(
        @Headers('user_id') user_id: string,
        @Query('skip', new DefaultsTo(0), new ParseIntPipe()) skip: number,
        @Query('limit', new DefaultsTo(100), new ParseIntPipe()) limit: number,
    ) {
        return this.moviesService.getLastViewedMovies(user_id);
    }

    @Get(':id')
    public getMovieDetails(
        @Param('id', new ParseIntPipe()) id: number,
        @Headers('user_id') user_id: string,
    ) {
        return this.moviesService.getMovie(id, { user_id });
    }

    @Get(':id/views')
    public getMovieViews(@Param('id', new ParseIntPipe()) id: number) {
        return this.moviesService.getMovieViews(id);
    }

    @Put(':id/views')
    public updateViewCount(
        @Param('id', new ParseIntPipe()) movieId: number,
        @Headers('userId') userIdString: string,
    ) {
        let userId: number | null = parseInt(userIdString, 10);

        if (isNaN(userId)) {
            userId = null;
        }

        return this.moviesService.incrementMovieViewsCount(movieId, userId);
    }

    @Post(':id/hidden')
    @UseGuards(AuthGuard('jwt'))
    // @UseGuards(AdminGuard) // TODO: admin guard
    public setMovieVisibility(
        @Param('id', new ParseIntPipe()) movieId: number,
        @Body('hidden') hidden: boolean,
    ) {
        return this.moviesService.changeMovieVisibility(movieId, hidden);
    }

    // TODO: move to userService
    @Put(':id/progress')
    @UseGuards(AuthGuard('jwt'))
    public updateProgress(
        @Param('id', new ParseIntPipe()) movieId: number,
        @Body('currentTime') currentTime: number,
        @Headers('userId') userIdString: string,
    ) {
        logger.debug(`updating movie = ${movieId} progress for user ${userIdString} -> ${currentTime}`);
        // return this.moviesService.updateProgress(movieId, currentTime);
    }

    @Put(':id/rating')
    @UseGuards(AuthGuard('jwt'))
    public rateMovie(
        @Param('id', new ParseIntPipe()) movieId: number,
        @Body() rating: Pick<IMovieRating, 'movie_id' | 'user_id' | 'rating'>,
        @Headers('userId') userIdString: string,
    ) {
        this.moviesService.rateMovie(rating);
    }

    @Get(':id/stream')
    public async stream(
        @Req() req: Request,
        @Res() res: Response,
        @Headers('range') range,
        @Param('id', new ParseIntPipe()) id: number,
    ) {
        const videoSource = await this.moviesService.getVideoSource(id);

        if (videoSource.source === 's3') {
            const stream = await this.moviesService.getS3Stream({
                range,
                s3ObjectParams: videoSource.s3ObjectParams,
                headersListener: (statusCode, headers) => res.writeHead(statusCode, headers),
            });

            stream.pipe(res);
        } else {
            const ytRequest = await this.moviesService.getYTStream(videoSource.youtube_id);
            req
                .pipe(ytRequest)
                .pipe(res);
        }
    }
}

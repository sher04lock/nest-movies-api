import { Controller, Get, Param, ParseIntPipe, Req, Headers, Res, Query, Put, Post, Body, UseGuards } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Request, Response } from 'express';
import { DefaultsTo } from '../common/pipes/defaults-to.pipe';
import { logger } from '../common/logger/LoggerProvider';
import { IMovieRating } from '../repositories/MovieRatingsRepository';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../users/user.decorator';
import { IUserDocument } from '../repositories/UserRepository';
import { OdataOrderByPipe } from '../common/pipes/odata-orderby.pipe';
import { OdataFilterPipe } from '../common/pipes/odata-filter.pipe';

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

    @Get('/odata')
    public queryOdata(
        @Query('$top', new DefaultsTo(0), new ParseIntPipe()) limit?: number,
        @Query('$skip', new DefaultsTo(0), new ParseIntPipe()) skip?: number,
        @Query('$orderby', new OdataOrderByPipe()) sort?: object,
        @Query('$filter', new OdataFilterPipe()) filter?: object,
    ) {

        return this.moviesService.queryOdata({ filter, limit, skip, sort });
    }

    @Get('/last-viewed')
    public getLastViewedMovies(
        @User() user: IUserDocument,
        @Query('skip', new DefaultsTo(0), new ParseIntPipe()) skip: number,
        @Query('limit', new DefaultsTo(100), new ParseIntPipe()) limit: number,
    ) {
        return this.moviesService.getLastViewedMovies(user);
    }

    @Get('/saved')
    public getSavedMovies(
        @User() user: IUserDocument,
        @Query('skip', new DefaultsTo(0), new ParseIntPipe()) skip: number,
        @Query('limit', new DefaultsTo(100), new ParseIntPipe()) limit: number,
    ) {
        return this.moviesService.getSavedMovies(user);
    }

    @Get('/search')
    public search(
        @Query('q') term: string,
        @Query('skip', new DefaultsTo(0), new ParseIntPipe()) skip: number,
        @Query('limit', new DefaultsTo(20), new ParseIntPipe()) limit: number,
    ) {
        return this.moviesService.searchMovie(term, { skip, limit });
    }

    @Get(':id')
    public getMovieDetails(
        @Param('id', new ParseIntPipe()) id: number,
        @User() user: IUserDocument,
    ) {
        return this.moviesService.getMovie(id, { user });
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

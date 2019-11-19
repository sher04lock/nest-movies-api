import { Controller, Get, Param, ParseIntPipe, Req, Headers, Res, Query, Put, Header } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Request, Response } from 'express';
import { DefaultsTo } from '../common/pipes/defaults-to.pipe';

@Controller('movies')
export class MoviesController {

    constructor(private readonly moviesService: MoviesService) { }

    @Get('/')
    public getMostViewedMovies(
        @Query('skip', new DefaultsTo(0), new ParseIntPipe()) skip: number,
        @Query('limit', new DefaultsTo(100), new ParseIntPipe()) limit: number,
    ) {
        return this.moviesService.getMostViewedMovies({ skip, limit });
    }

    @Get(':id')
    public getMovieDetails(@Param('id', new ParseIntPipe()) id: number) {
        return this.moviesService.getMovie(id);
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

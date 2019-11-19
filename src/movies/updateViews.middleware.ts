import { NestMiddleware, Injectable } from "@nestjs/common";
import { Request, Response, NextFunction } from 'express';
import { MoviesService } from "./movies.service";
import { logger } from "../common/logger/LoggerProvider";

@Injectable()
export class UpdateViewsMiddleware implements NestMiddleware {
    constructor(private readonly movieService: MoviesService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const movieId = parseInt(req.params.id, 10);
        let userId = parseInt(req.header("userId"), 10);

        if (isNaN(userId)) {
            userId = null;
        }

        try {
            await this.movieService.incrementMovieViewsCount(movieId, userId);
        } catch (err) {
            logger.error("Updating views failed", err);
        }

        next();
    }
}

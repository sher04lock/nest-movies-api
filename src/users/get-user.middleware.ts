import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { logger } from '../common/logger/LoggerProvider';

@Injectable()
export class GetUserMiddleware implements NestMiddleware {

    constructor(private readonly userService: UsersService) { }
    async use(req: Request, res: Response, next: Function) {
        const userId = req.header('user_id');

        let user;

        try {
            if (userId) {
                user = await this.userService.findById(userId);
            }
        } catch (err) {
            logger.error('GetUserMiddleware error', err);
        }

        req.user = user;
        next();
    }
}

import { Controller, Headers, Request, UseGuards, Put, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {


    constructor(private readonly userService: UsersService) { }

    @Put('/:user_id/watch-progress')
    public async saveUserWatchProgress(
        @Param('user_id') user_id: string,
        @Body('movie_id') movie_id: number,
        @Body('currentTime') currentTime: number,
    ) {
        return this.userService.saveUserWatchProgress(user_id, movie_id, currentTime);
    }
}

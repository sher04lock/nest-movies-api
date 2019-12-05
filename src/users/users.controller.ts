import { Controller, Put, Body, Param, Post } from '@nestjs/common';
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

    @Post('/:user_id/watch-later')
    public async setSavedForLater(
        @Param('user_id') user_id: string,
        @Body('movie_id') movie_id: number,
        @Body('savedForLater') savedForLater: boolean,
    ) {
        return this.userService.setSavedForLater(user_id, movie_id, savedForLater);
    }
}

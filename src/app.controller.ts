import { Controller, Get, UseGuards, Post, Request, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { logger } from './common/logger/LoggerProvider';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/dto/create-user.dto';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService, 
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    ) { }

  @Get()
  getHello(): string {
    logger.info('hello');
    return this.appService.ping();
  }

  @HttpCode(HttpStatus.OK)
  @Post('auth/register')
  async register(@Body() body: CreateUserDto) {
    return this.userService.register(body);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}

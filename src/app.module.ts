import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GetUserMiddleware } from './users/get-user.middleware';
import { MoviesController } from './movies/movies.controller';

@Module({
  imports: [
    CommonModule,
    MoviesModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GetUserMiddleware)
      .forRoutes(MoviesController);
  }
 }

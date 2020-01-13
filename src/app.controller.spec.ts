import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './repositories/UserRepository';
import { MONGO_CLIENT } from './common/providers/constants';
import { CACHE_MANAGER } from '@nestjs/common';
import { caching } from 'cache-manager';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        AuthService,
        UsersService,
        { provide: JwtService, useValue: {} },
        UserRepository,
        {
          provide: MONGO_CLIENT,
          useValue: { db: (string) => { } }
        },
        {
          provide: CACHE_MANAGER,
          useValue: caching({ store: "none", ttl: 1 }),
        }
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should pong', () => {
      expect(appController.getHello()).toMatch(/\d+/);
    });
  });
});

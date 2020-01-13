import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt = require('bcrypt');

class MockUserService {
  async findOne(...args) {
    const passwordHash = await bcrypt.hash('123', 10);
    return {
      user: 'user1',
      passwordHash,
    };
  }
}

describe('AuthService', () => {
  let service: AuthService;
  let userService: MockUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useClass: MockUserService },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<MockUserService>(UsersService as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('#validateUser - should return null when no user found', async () => {
    jest.spyOn(userService, "findOne").mockImplementationOnce(async () => null);
    const result = await service.validateUser("user", "password");
    expect(result).toBeNull();
  });

  it('#validateUser - should return null when password does not match', async () => {
    jest.spyOn(userService, "findOne").mockImplementationOnce(async () => ({ user: 'user1', passwordHash: String(Math.random()) }));
    const result = await service.validateUser("user", "123");
    expect(result).toBeNull();
  });

  it('#validateUser - should return object without passwordHash when password matches', async () => {
    const result = await service.validateUser("user", "123");
    expect(result).toBeDefined();
    expect(result.passwordHash).toBeUndefined();
  });
});

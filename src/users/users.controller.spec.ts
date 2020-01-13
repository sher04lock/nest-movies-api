import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from '../repositories/UserRepository';
import { IRepository } from '../repositories/IRepository';

class MockedRepository implements IRepository<any> {
  getAll(): Promise<any[]> {
    throw new Error("Method not implemented.");
  }
  find(...args): Promise<any[]> {
    throw new Error("Method not implemented.");
  }
  findOne(...args): Promise<any> {
    throw new Error("Method not implemented.");
  }
}

describe('Users Controller', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: UserRepository, useClass: MockedRepository },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

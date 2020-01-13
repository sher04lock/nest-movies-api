import { Test, TestingModule } from '@nestjs/testing';
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

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useClass: MockedRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

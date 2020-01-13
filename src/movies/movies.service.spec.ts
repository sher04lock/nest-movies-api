import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { MovieRepository } from '../repositories/MovieRepository';
import { MovieRatingsRepository } from '../repositories/MovieRatingsRepository';
import { MovieViewsRepository } from '../repositories/MovieViewsRepository';
import { MONGO_CLIENT } from '../common/providers/constants';
import { MemoryCacheProvider } from '../common/providers/memory-cache.provider';
import { OmdbApiClientService } from '../omdb-api-client/omdb-api-client.service';
import { ConfigService } from '../common/config/config.service';
import { MockedHttpService } from '../omdb-api-client/omdb-api-client.service.spec';
import { HttpService, CACHE_MANAGER } from '@nestjs/common';
import { caching } from 'cache-manager';


describe('MoviesService', () => {
  let service: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        MovieRepository,
        MovieRatingsRepository,
        MovieViewsRepository,
        ConfigService,
        OmdbApiClientService,
        MemoryCacheProvider,
        { provide: HttpService, useClass: MockedHttpService },
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

    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

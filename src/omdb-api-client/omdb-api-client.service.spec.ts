import { Test, TestingModule } from '@nestjs/testing';
import { OmdbApiClientService } from './omdb-api-client.service';
import { HttpService, CACHE_MANAGER } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

import { caching, Cache } from "cache-manager";
import { of } from 'rxjs';

export class MockedHttpService {
  get(...args) {
    const result = {
      data: {
        name: 'Jane Doe',
        grades: [3.7, 3.8, 3.9, 4.0, 3.6],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };

    return of(result);
  }
}

describe('OmdbApiClientService', () => {
  let service: OmdbApiClientService;
  let httpClient: MockedHttpService;

  let httpClientSpy: jest.SpyInstance;

  let cacheSpy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OmdbApiClientService,
        ConfigService,
        { provide: HttpService, useClass: MockedHttpService },
        {
          provide: CACHE_MANAGER,
          useValue: caching({ store: "none", ttl: 1 }),
        },
      ],
    }).compile();

    service = module.get<OmdbApiClientService>(OmdbApiClientService);
    httpClient = module.get<MockedHttpService>(HttpService);

    httpClientSpy = jest.spyOn(httpClient, "get");

    cacheSpy = jest.spyOn(module.get<Cache>(CACHE_MANAGER), "wrap");
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call getMovieDetails', async () => {
    const imdbId = "1231";
    const response = await service.getMovieDetails(imdbId);
    expect(response).toBeDefined();
    expect(httpClientSpy).toHaveBeenCalled();
    expect(cacheSpy).toHaveBeenCalled();
  });

  it('cache should not be used', async () => {
    const imdbId = "1231";
    await service.getMovieDetails(imdbId);
    await service.getMovieDetails(imdbId);
    expect(httpClientSpy).toHaveBeenCalledTimes(2);
  });
});

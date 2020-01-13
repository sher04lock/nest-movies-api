import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Returning environmental variables', () => {
    const expectedValues = {
      port: "9999",
      mongoUrl: "mongoUrl",
      cacheStore: "none",
      redisHost: "redisHost",
      redisPort: "8989",
      redisPassword: "pwd",
      logLevel: "info-test"
    };

    beforeAll(() => {
      const { port, mongoUrl, cacheStore, redisHost, redisPort, redisPassword, logLevel } = expectedValues;
      process.env.PORT = port;
      process.env.MONGO_URL = mongoUrl;
      process.env.CACHE_STORE = cacheStore;
      process.env.REDIS_HOST = redisHost;
      process.env.REDIS_PORT = redisPort;
      process.env.REDIS_PASSWORD = redisPassword;
      process.env.LOG_LEVEL = logLevel;
      process.env.AWS_ACCESS_KEY_ID = 'aws-key-id';
      process.env.AWS_SECRET_ACCESS_KEY = 'aws-secret-key';
    });

    for (const [key, value] of Object.entries(expectedValues)) {
      it(`#get ${key}`, () => {

        expect(service[key]).toBe(value);
      });
    }

    it('#get awsSecrets', () => {
      const expected = {
        awsAccessKeyId: 'aws-key-id',
        awsSecretAccessKey: 'aws-secret-key',
      };

      expect(service.awsSecrets).toStrictEqual(expected);
    });
  });

  describe('Default values', () => {
    const expectedValues = {
      port: 3000,
      mongoUrl: 'mongodb://localhost/movies',
      cacheStore: "memory",
      redisHost: "localhost",
      redisPort: 6379,
    };

    beforeAll(() => {
      process.env.PORT = "";
      process.env.MONGO_URL = "";
      process.env.CACHE_STORE = "";
      process.env.REDIS_HOST = "";
      process.env.REDIS_PORT = "";
      process.env.REDIS_PASSWORD = "";
      process.env.LOG_LEVEL = "";
      process.env.AWS_ACCESS_KEY_ID = "";
      process.env.AWS_SECRET_ACCESS_KEY = "";
    });

    for (const [key, value] of Object.entries(expectedValues)) {
      it(`#get ${key}`, () => {

        expect(service[key]).toBe(value);
      });
    }
  });
});

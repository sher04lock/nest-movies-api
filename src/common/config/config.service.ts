import { Injectable } from '@nestjs/common';

const LOCAL_MONGO = 'mongodb://localhost/movies';

const LOCAL_REDIS = 'localhost';
const REDIS_DEFAULT_PORT = 6379;
const MEMORY_CACHE = 'memory';

interface AwsSecrets {
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
}

@Injectable()
export class ConfigService {

    get port() {
        return process.env.PORT || 3000;
    }

    get mongoUrl() {
        return process.env.MONGO_URL || LOCAL_MONGO;
    }

    get cacheStore(): 'redis' | 'memory' {
        return process.env.CACHE_STORE as any || MEMORY_CACHE;
    }

    get redisHost() {
        return process.env.REDIS_HOST || LOCAL_REDIS;
    }

    get redisPort() {
        return process.env.REDIS_PORT || REDIS_DEFAULT_PORT;
    }

    get awsSecrets(): AwsSecrets {
        return {
            awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
            awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        };
    }

    get logLevel() {
        return process.env.LOG_LEVEL;
    }

    get omdbApiInfo() {
        return {
            url: 'https://omdbapi.com',
            apiKey: process.env.OMDB_KEY,
        };
    }
}

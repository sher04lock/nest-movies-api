import { CacheModuleOptions, CacheOptionsFactory, Injectable } from "@nestjs/common";
import { SECOND } from "../cache/constants";
import { logger } from "../logger/LoggerProvider";
import { ConfigService } from "./config.service";
import redisStore = require('cache-manager-redis-store');

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {

    createCacheOptions(): CacheModuleOptions {
        const configService = new ConfigService();
        const store = configService.cacheStore;

        const options = {
            host: configService.redisHost,
            port: configService.redisPort,
            auth_pass: configService.redisPassword,
            store,
            ttl: 60 * SECOND,
            max: 10_1000,
        };

        if (store === 'redis') {
            logger.debug('Setting Redis as cache store.');
            options.store = redisStore;
        }

        return options;
    }
}

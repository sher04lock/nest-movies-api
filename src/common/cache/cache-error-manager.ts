import { Injectable, Inject, CACHE_MANAGER } from "@nestjs/common";
import { Cache } from 'cache-manager';
import { logger } from "../logger/LoggerProvider";

@Injectable()
export class CacheManagerEventsHandler {

    constructor(@Inject(CACHE_MANAGER) protected cache: Cache) {
        const store = (cache as any)?.store;

        if (!store.getClient || typeof store.getClient !== 'function') {
            return;
        }

        const client = (cache as any)?.store?.getClient();

        client.on('error', (error) => {
            logger.error(error);
        });

        client.on('connect', () => {
            logger.info('Connected to Redis');
        });
    }
}

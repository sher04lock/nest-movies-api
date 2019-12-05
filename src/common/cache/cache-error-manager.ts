import { Injectable, Inject, CACHE_MANAGER } from "@nestjs/common";
import { Cache } from 'cache-manager';
import { logger } from "../logger/LoggerProvider";

@Injectable()
export class CacheErrorManager {

    constructor(@Inject(CACHE_MANAGER) protected cache: Cache) {
        const client = (cache as any)?.store?.getClient();

        client.on('error', (error) => {
            logger.error(error);
        });
    }
}

import { Injectable, Inject, CACHE_MANAGER } from "@nestjs/common";
import { Cache } from 'cache-manager';

@Injectable()
export class CacheErrorManager {

    constructor(@Inject(CACHE_MANAGER) protected cache: Cache) {
        const client = (cache as any)?.store?.getClient();

        client.on('error', (error) => {
            console.info(error);
        });
    }
}

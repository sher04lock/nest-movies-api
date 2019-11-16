import { Provider } from "@nestjs/common";
import { caching } from 'cache-manager';

export const MemoryCacheProvider: Provider = {
    provide: 'MEMORY_CACHE_PROVIDER',
    useFactory: () => {
        return caching({ store: 'memory', ttl: 1000 });
    },
};

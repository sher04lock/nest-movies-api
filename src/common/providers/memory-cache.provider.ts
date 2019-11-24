import { Provider } from "@nestjs/common";
import { caching } from 'cache-manager';
import { MEMORY_CACHE_PROVIDER } from "./constants";

export const MemoryCacheProvider: Provider = {
    provide: MEMORY_CACHE_PROVIDER,
    useFactory: () => {
        return caching({ store: 'memory', ttl: 1000 });
    },
};

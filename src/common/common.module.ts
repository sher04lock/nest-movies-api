import { Module, Global, CacheModule, HttpModule } from '@nestjs/common';
import { Cacheable } from './cache/cacheable';
import { CacheConfigService } from './config/cache-config.service';
import { MemoryCacheProvider } from './providers/memory-cache.provider';
import { MongoClientProvider } from './providers/mongo-client.provider';
import { ConfigService } from './config/config.service';
import { CacheManagerEventsHandler } from './cache/cache-error-manager';

@Global()
@Module({
    imports: [
        HttpModule,
        CacheModule.registerAsync({ useClass: CacheConfigService }),
    ],
    providers: [
        Cacheable,
        CacheManagerEventsHandler,
        ConfigService,
        MemoryCacheProvider,
        MongoClientProvider,
    ],
    exports: [
        HttpModule,
        CacheModule,
        Cacheable,
        ConfigService,
        MemoryCacheProvider,
        MongoClientProvider,
    ],
})
export class CommonModule { }

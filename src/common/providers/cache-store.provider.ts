// import { ConfigService } from "../config/config.service";
// import { Provider } from "@nestjs/common";
// import redisStore = require('cache-manager-redis-store');

// export const CacheStoreProvider: Provider = {
//     provide: 'CacheStoreOptions',
//     useFactory: async (configService: ConfigService) => {
//         const store = this.configService.cacheStore;

//         const options = {
//             host: this.configService.redisHost,
//             port: this.configService.redisPort,
//             store,
//         };

//         if (store === 'redis') {
//             options.store = redisStore;
//         }

//         return options;
//     },
//     inject: [ConfigService],
// };

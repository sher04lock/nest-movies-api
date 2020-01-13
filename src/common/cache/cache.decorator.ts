import 'reflect-metadata';
import { InternalServerErrorException } from '@nestjs/common';
import { Cache } from "cache-manager";
import { logger } from '../logger/LoggerProvider';

/**
 * @param key key under which data will be stored. If not specified,
 * key will be generated based on ctor name, method name and arguments:
 * class_name:method_name:arg1arg2arg3
 * @param options
 */
export function Cache(options?: { key?: string, ttl: number, useFirstParamAsKey?: boolean, keyPrefix?: string }) {
    return (target: any, methodName: string, descriptor: TypedPropertyDescriptor<any>) => {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;

        descriptor.value = async function (...args: any[]) {
            const cache: Cache = this.cache;
            if (!cache) {
                throw new InternalServerErrorException('Target class have `cache` property');
            }

            if (!this.cacheEnabled) {
                return originalMethod.apply(this, args);
            }

            let cacheKey = options?.key
                || options?.useFirstParamAsKey && args[0]?.toString()
                || `${className}:${methodName}:${args.map(a => JSON.stringify(a)).join()}`;

            cacheKey = (options?.keyPrefix || "") + cacheKey;

            let wasCached = true;

            try {

                const value = await cache.wrap(cacheKey,
                    () => {
                        wasCached = false;
                        return originalMethod.apply(this, args);
                    },
                    options);

                if (wasCached) {
                    logger.debug(`Returning '${cacheKey}' from cache.`);
                } else {
                    logger.debug(`Cached key: '${cacheKey}'.`);

                }

                return value;
            } catch (err) {
                logger.error(`Cache decorator for ${cacheKey} failed`, err);
                return {};
            }

            const cacheResult = await cache.get(cacheKey);

            if (cacheResult) {
                logger.debug(`Returning ${cacheKey} from cache.`);
                return cache;
            }

            const serviceResult = await originalMethod.apply(this, args);

            logger.debug(`Caching ${cacheKey}.`);
            cache.set(cacheKey, serviceResult, options);

            return serviceResult;
        };

        return descriptor;
    };
}

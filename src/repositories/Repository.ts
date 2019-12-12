import { IRepository } from "./IRepository";
import { Db, FilterQuery, FindOneOptions, MongoClient, UpdateOneOptions, UpdateQuery, MongoCountPreferences, CollectionInsertOneOptions } from "mongodb";
import { Injectable, Inject } from "@nestjs/common";
import { Cacheable } from "../common/cache/cacheable";
import { MONGO_CLIENT } from "../common/providers/constants";

export interface IQueryParams {
    skip: number;
    limit: number;
}

// export interface ICacheOptions {
//     useCache: boolean;
//     key?: string;
// }

export type NoCacheOptions = {
    useCache: false;
}

export type UseCacheOptions = {
    useCache: true;
    key?: string;
    ttl?: number;
}

export type ICacheOptions = NoCacheOptions | UseCacheOptions;

@Injectable()
export abstract class Repository<T> extends Cacheable implements IRepository<T>  {
    protected abstract collectionName: string;

    protected abstract dbName: string;

    protected db!: Db;

    get collection() {
        return this.db.collection<T>(this.collectionName);
    }

    constructor(@Inject(MONGO_CLIENT) protected readonly mongoClient: MongoClient) {
        super();
        this.getDb();
    }

    protected getDb() {
        this.db = this.mongoClient.db(this.dbName);
    }

    async getAll() {
        return this.db.collection<T>(this.collectionName).find({}).toArray();
    }

    async count(query?: FilterQuery<T>, options?: MongoCountPreferences) {
        return this.db.collection<T>(this.collectionName).countDocuments(query, options);
    }

    async find(filter: FilterQuery<T>, options?: FindOneOptions) {
        return this.db.collection<T>(this.collectionName).find(filter, options).toArray();
    }

    async findOne(filter: FilterQuery<T>, options?: FindOneOptions, cacheOptions?: ICacheOptions): Promise<T> {
        if (!cacheOptions?.useCache) {
            return this.db.collection(this.collectionName).findOne<T>(filter, options);
        }

        const { key, ttl } = cacheOptions;
        const cacheKey = key || this.getCacheKey(filter, options);

        return this.cache.wrap<T>(cacheKey,
            () => this.db.collection(this.collectionName).findOne<T>(filter, options), { ttl });
    }

    async insertOne(
        doc: T,
        options?: CollectionInsertOneOptions,
    ) {
        return this.db.collection(this.collectionName).insertOne(doc, options);
    }

    async updateOne(
        filter: FilterQuery<T>,
        update: UpdateQuery<T> | Partial<T>,
        options?: UpdateOneOptions,
    ) {
        return this.db.collection(this.collectionName).updateOne(filter, update, options);
    }

    protected getCacheKey(...args) {
        return `${this.collectionName}.${args.map(x => JSON.stringify(x)).join()}`;
    }
}

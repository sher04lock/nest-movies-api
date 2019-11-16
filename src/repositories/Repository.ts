import { IRepository } from "./IRepository";
import { Db, FilterQuery, FindOneOptions, MongoClient } from "mongodb";
import { Injectable, Inject } from "@nestjs/common";
import { Cacheable } from "../common/cache/cacheable";

export interface IQueryParams {
    skip: number;
    limit: number;
}

@Injectable()
export abstract class Repository<T> extends Cacheable implements IRepository<T>  {
    protected abstract collectionName: string;

    protected abstract dbName: string;

    protected db!: Db;

    get collection() {
        return this.db.collection<T>(this.collectionName);
    }

    constructor(@Inject('MongoClient') protected readonly mongoClient: MongoClient) {
        super();
        this.getDb();
    }

    protected getDb() {
        this.db = this.mongoClient.db(this.dbName);
    }

    async getAll() {
        return this.db.collection<T>(this.collectionName).find({}).toArray();
    }

    async find(filter: FilterQuery<T>, options?: FindOneOptions) {
        return this.db.collection<T>(this.collectionName).find(filter, options).toArray();
    }

    async findOne(filter: FilterQuery<T>, options?: FindOneOptions) {
        const cacheKey = this.getCacheKey(filter, options);
        return this.cache.wrap(cacheKey,
            () => this.db.collection(this.collectionName).findOne<T>(filter, options),
        );
    }

    protected getCacheKey(...args) {
        return `${this.collection}.${args.map(x => JSON.stringify(x)).join()}`;
    }
}

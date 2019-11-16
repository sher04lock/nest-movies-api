import { FilterQuery, FindOneOptions } from "mongodb";

export interface IRepository<T> {
    getAll(): Promise<T[]>;
    find(filter: FilterQuery<T>, options?: FindOneOptions): Promise<T[]>;
    findOne(filter: FilterQuery<T>, options?: FindOneOptions): Promise<T | null>;
}

import { Repository } from "./Repository";
import { ObjectId } from "mongodb";
import { Injectable } from "@nestjs/common";

export enum IUserRole {
    standard = 'standard',
    admin = 'admin',
}

export interface IUserDocument {
    _id?: ObjectId;
    // movieProgress: Array<{ movie_id: number; currentTime: number }>;
    watchProgress: { [movie_id: string]: number };
    savedForLater: number[];
    username: string;
    passwordHash: string;
    userRole: IUserRole;
    createdAt?: Date;
}

@Injectable()
export class UserRepository extends Repository<IUserDocument> {
    protected readonly collectionName = 'users';
    protected readonly dbName = 'movies';
}

import { Repository, IQueryParams } from "./Repository";
import { ObjectID } from "mongodb";
import { Injectable } from "@nestjs/common";

export interface IMovieViewInfo {
    _id: ObjectID;
    movie_id: number;
    user_id: number;
    views: number;
}

@Injectable()
export class MovieViewsRepository extends Repository<IMovieViewInfo> {
    protected readonly collectionName = 'movie_views';
    protected readonly dbName = 'movies';

    public async incrementViewCount(movieId: number, userId: number) {
        await this.collection.updateOne(
            { user_id: userId, movie_id: movieId },
            { $inc: { views: 1 } },
            { upsert: true },
        );
    }

    public async getMovieViews(movieId: number) {
        return this.collection.aggregate([
            { $match: { movie_id: movieId } },
            { $group: { _id: "$movie_id", views: { $sum: "$views" } } },
            { $project: { _id: 0, movie_id: "$_id", views: 1 } },
        ]).toArray();
    }
}

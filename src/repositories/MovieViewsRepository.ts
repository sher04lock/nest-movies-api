import { Repository, IQueryParams } from "./Repository";
import { ObjectID } from "mongodb";
import { Injectable } from "@nestjs/common";
import moment = require('moment');

export interface IMovieViewInfo {
    _id: ObjectID;
    movie_id: number;
    user_id: number | string;
    views: number;
}

export interface ILastViewedMovie {
    movie_id: number;
    lastUpdated: Date;
    views: number;
    title: string;
    imdb_id: string;
}

@Injectable()
export class MovieViewsRepository extends Repository<IMovieViewInfo> {
    protected readonly collectionName = 'movie_views';
    protected readonly dbName = 'movies';

    public async incrementViewCount(movieId: number, userId: number | string) {
        await this.collection.updateOne(
            { user_id: userId, movie_id: movieId },
            { $inc: { views: 1 }, $set: { lastUpdated: moment.utc().toDate() } },
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

    public async getLastViewedMovies(user_id: string): Promise<ILastViewedMovie[]> {
        return this.collection.aggregate([
            { $match: { user_id } },
            { $sort: { lastUpdated: -1 } },
            {
                $lookup: {
                    from: 'movies',
                    localField: 'movie_id',
                    foreignField: 'movie_id',
                    as: 'movie'
                }
            },
            { $match: { "movie.hidden": { $ne: true } } },
            {
                $project: {
                    _id: 0,
                    movie_id: 1,
                    views: 1,
                    lastUpdated: -1,
                    title: { $arrayElemAt: ["$movie.title", 0] },
                    imdb_id: { $arrayElemAt: ["$movie.imdb_id", 0] }
                }
            },
        ]).toArray() as any as ILastViewedMovie[];
    }
}

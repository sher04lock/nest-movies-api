import { Repository, IQueryParams } from "./Repository";
import { ObjectID } from "mongodb";
import { Injectable } from "@nestjs/common";

export interface IMovieRating {
    _id: ObjectID;
    movie_id: number;
    user_id: number | string;
    rating: number;
    title: string;
    genre: string;
}

@Injectable()
export class MovieRatingsRepository extends Repository<IMovieRating> {
    protected readonly collectionName = 'movie_ratings';
    protected readonly dbName = 'movies';

    public async getMostRatedMovies({ limit, skip }: IQueryParams) {
        const cursor = this.collection.aggregate([
            {
                $group: {
                    _id: '$movie_id',
                    title: { $first: '$title' },
                    imdb_id: { $first: '$imdb_id' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: limit + skip },
            { $skip: skip },
            {
                $lookup: {
                    from: 'movies',
                    as: 'movie',
                    localField: '_id',
                    foreignField: 'movie_id',
                },
            },
            { $unwind: "$movie" },
            { $match: { "movie.hidden": { $ne: true } } },
            {
                $project: {
                    id: "$_id",
                    title: 1,
                    count: 1,
                    movie_id: "$movie.movie_id",
                    imdb_id: "$movie.imdb_id",
                },
            },
        ]);

        const key = this.getCacheKey(skip, limit);
        return this.cache.wrap(
            key,
            () => cursor.toArray());
    }

    public clearCache() {
        const key = this.getCacheKey();
        return this.cache.del(key);
    }

    protected getCacheKey(skip: number = 0, limit: number = 20) {
        return `top_rated:skip=${skip},limit=${limit}`;
    }
}

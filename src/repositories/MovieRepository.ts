import { Repository, IQueryParams } from "./Repository";
import { ObjectID } from "mongodb";
import { Injectable } from "@nestjs/common";

export interface IS3ObjectParams {
    bucket: string;
    key: string;
}

export interface IMovieDocument {
    _id: ObjectID;
    movie_id: number;
    title: string;
    genres: string[];
    genresString: string;
    year: string;
    avgRating?: number;

    youtube_id: string;
    imdb_id: string;

    s3?: IS3ObjectParams;

    hidden?: boolean;
}

@Injectable()
export class MovieRepository extends Repository<IMovieDocument> {
    protected readonly collectionName = 'movies';
    protected readonly dbName = 'movies';

    public search(term: string, { limit, skip }: IQueryParams) {
        const cursor = this.collection
            .find(
                { $text: { $search: term } },
                { projection: { score: { $meta: "textScore" }, title: 1, imdb_id: 1, movie_id: 1 } }
            )
            .sort({ score: { $meta: "textScore" } })
            .limit(limit + skip)
            .skip(skip);

        return cursor.toArray();
    }
}

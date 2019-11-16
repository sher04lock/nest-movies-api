import { Repository } from "./Repository";
import { ObjectID } from "mongodb";
import { Injectable } from "@nestjs/common";

export interface IS3ObjectParams {
    bucket: string;
    key: string;
}

export interface IMovie {
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
}

@Injectable()
export class MovieRepository extends Repository<IMovie> {
    protected readonly collectionName = 'movies';
    protected readonly dbName = 'movies';
}

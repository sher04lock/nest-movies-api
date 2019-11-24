import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/UserRepository';
import { ObjectID } from 'mongodb';

@Injectable()
export class UsersService {

    constructor(private readonly userRepository: UserRepository) { }

    public async findOne(username: string) {
        return this.userRepository.findOne({ username });
    }

    public async saveUserWatchProgress(userId: string, movie_id: number, currentTime: number) {

        return this.userRepository.updateOne(
            { _id: new ObjectID(userId) },
            { $set: { [`watchProgress.${movie_id}`]: currentTime } })
    }
}

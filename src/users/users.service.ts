import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/UserRepository';
import { ObjectID } from 'mongodb';

@Injectable()
export class UsersService {

    constructor(private readonly userRepository: UserRepository) { }

    public async findOne(username: string) {
        return this.userRepository.findOne({ username });
    }

    public async findById(id: string) {
        return this.userRepository.findOne({ _id: new ObjectID(id) });
    }

    public async saveUserWatchProgress(userId: string, movie_id: number, currentTime: number) {

        return this.userRepository.updateOne(
            { _id: new ObjectID(userId) },
            { $set: { [`watchProgress.${movie_id}`]: currentTime } })
    }

    public async setSavedForLater(userId: string, movie_id: number, savedForLater: boolean) {
        const updateOperator = savedForLater
            ? { $addToSet: { savedForLater: movie_id } }
            : { $pull: { savedForLater: movie_id } };

        return this.userRepository.updateOne(
            { _id: new ObjectID(userId) },
            updateOperator
        );
    }
}

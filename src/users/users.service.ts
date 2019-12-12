import { Injectable } from '@nestjs/common';
import { UserRepository, IUserDocument, IUserRole } from '../repositories/UserRepository';
import { ObjectID } from 'mongodb';
import bcrypt = require('bcrypt');
import moment = require('moment');

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {

    constructor(private readonly userRepository: UserRepository) { }

    async register({ username, password }: { username: string, password: string }) {
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const userDocument: IUserDocument = {
            username,
            passwordHash,
            userRole: IUserRole.standard,
            savedForLater: [],
            watchProgress: {},
            createdAt: moment.utc().toDate(),
        };

        await this.userRepository.insertOne(userDocument);

        const { passwordHash: skipme, ...user } = userDocument;

        return user;
    }

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

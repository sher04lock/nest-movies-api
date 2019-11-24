import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import bcrypt = require('bcrypt');
import { JwtService } from '@nestjs/jwt';
import { IUserDocument } from '../repositories/UserRepository';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);

        if (user && await bcrypt.compare(pass, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }

        return null;
    }

    async login(user: IUserDocument) {
        const payload = { username: user.username, sub: user._id };
        const { passwordHash, ...userData } = user;

        return {
            access_token: this.jwtService.sign(payload),
            user: userData
        };
    }
}

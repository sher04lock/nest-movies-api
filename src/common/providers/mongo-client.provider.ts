import { Provider } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { ConfigService } from '../config/config.service';
import { logger } from '../logger/LoggerProvider';

export const MongoClientProvider: Provider = {
    provide: 'MongoClient',
    useFactory: async (configService: ConfigService) => {
        const client = await MongoClient.connect(configService.mongoUrl, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });

        logger.info('Connected to MongoDb');
        return client;
    },
    inject: [ConfigService],
};

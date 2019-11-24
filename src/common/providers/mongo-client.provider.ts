import { Provider } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { ConfigService } from '../config/config.service';
import { logger } from '../logger/LoggerProvider';
import { MONGO_CLIENT } from './constants';

function subscribeToCommandsEvents(client: MongoClient) {
    const startedCommands = new Map<number, any>();

    const logCommand = (eventName: string, e) => {
        const startedCommand = startedCommands.get(e.requestId) || { databaseName: undefined, command: {} };

        const {databaseName, commandName, command} = startedCommand;
        logger.debug(
            `DB | ${commandName} - ns: ${databaseName}.${command[e.commandName]}, duration: ${e.duration}`);
    }

    // commandStarted will fire when a command is sent to the server
    client.on("commandStarted", e => {
        startedCommands.set(e.requestId, e);
    });

    // commandSucceeded will fire when the response comes back and doesn't have an error
    client.on("commandSucceeded", (e) => {
        if (e.commandName !== 'ismaster') {
            logCommand('ok!', e);
        };

        startedCommands.delete(e.requestId);
    });

    // commandFailed will fire when the response comes back with an error
    client.on("commandFailed", (e) => {
        logger.error(e.failure);
        startedCommands.delete(e.requestId);
    });
}

export const MongoClientProvider: Provider = {
    provide: MONGO_CLIENT,
    useFactory: async (configService: ConfigService) => {
        const client = await MongoClient.connect(configService.mongoUrl, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            monitorCommands: true,
        });

        subscribeToCommandsEvents(client);

        logger.info('Connected to MongoDb');

        return client;
    },
    inject: [ConfigService],
};

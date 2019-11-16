import morgan = require('morgan');
import { logger } from './LoggerProvider';
// import { logger } from '.';

export const logIncomingRequest = morgan("tiny", {
    immediate: true,
    stream: { write: message => logger.info(`> REQUEST_START - ${message.trim()}`) },
    // skip: (req, res) => req.path.includes('stream'),
});

export const logRequestEnd = morgan("tiny", {
    stream: { write: message => logger.info(`< REQUEST_END - ${message.trim()}`) },
    // skip: (req, res) => res.statusCode === 206,
});

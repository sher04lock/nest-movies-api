import winston = require("winston");
import cls = require("cls-hooked");

class LoggerProvider {
    public static create() {
        const transports = [
            new winston.transports.Console({
                handleExceptions: true,
                stderrLevels: ["error"]
            })
        ];

        const alignedWithColorsAndTime = winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf((info) => {
                const {
                    timestamp, level, message, ...args
                } = info;

                const ts = timestamp.slice(0, 19).replace('T', ' ');
                const ns = cls.getNamespace("global");
                const requestId = ns?.get('requestId');

                const requestIdLogPart = requestId ? `${requestId} |` : "";
                const levelPadded = level.padEnd(15);
                return `${ts} [${levelPadded}]: ${requestIdLogPart} ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
            }),
        );

        return winston.createLogger({
            transports,
            exitOnError: false,
            level: process.env.LOG_LEVEL || "info",
            format: alignedWithColorsAndTime,
        });
    }
}

export const logger = LoggerProvider.create();

import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as dailyRotateFile from 'winston-daily-rotate-file';
import * as winston from 'winston';
import * as path from 'path';

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === 'production'
          ? winston.format.simple()
          : winston.format.combine(
              winston.format.timestamp(),
              winston.format.ms(),
              nestWinstonModuleUtilities.format.nestLike('Member', {
                prettyPrint: true,
              }),
            ),
    }),
    new dailyRotateFile({
      level: 'error',
      dirname: path.resolve(__dirname, `../../log/error`),
      filename: `%DATE%.error.log`,
      maxFiles: '14d',
      zippedArchive: true,
    }),
    new dailyRotateFile({
      level: 'info',
      dirname: path.resolve(__dirname, `../../log/info`),
      filename: `%DATE%.info.log`,
      maxFiles: '14d',
      zippedArchive: true,
    }),
  ],
});

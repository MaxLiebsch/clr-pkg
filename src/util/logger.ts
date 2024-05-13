import pino, { Logger } from 'pino';
import 'dotenv/config';
import { config } from 'dotenv';

export const logger = pino();

const environment = process.env.NODE_ENV;
config({
  path: [`.env.${environment}`],
});
const mongoUri = process.env['CRAWLER-DATA_MONGODB_URI'];

export class LoggerService {
  public logger: Logger;
  public errorLogger: Logger;

  public static singleton: LoggerService;

  public static getSingleton(): LoggerService {
    if (!LoggerService.singleton) {
      LoggerService.singleton = new LoggerService();
    }
    return LoggerService.singleton;
  }
  constructor() {
    if (mongoUri) {
      const transport = pino.transport({
        target: 'pino-mongodb',
        options: {
          uri: mongoUri,
          database: 'crawler-data',
          collection: 'logs',
        },
      });
      this.logger = pino(transport);
      const errorTransport = pino.transport({
        target: 'pino-mongodb',
        options: {
          uri: mongoUri,
          database: 'crawler-data',
          collection: 'errors',
        },
      });
      this.errorLogger = pino(errorTransport);
    } else {
      this.errorLogger = pino();
      this.logger = pino();
    }
  }
}

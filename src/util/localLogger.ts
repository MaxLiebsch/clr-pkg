import pino from 'pino';
import path from 'path';
import jetpack from 'fs-jetpack';
import { scheduleJob } from 'node-schedule';
import os from 'os';
import { TaskTypes } from '../types/QueueTask';

const defaultLogDirectory =
  os.platform() === 'linux' ? '/var/logs/tasks' : './var/logs/tasks';

function getTimestamp() {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/T/, '_')
    .replace(/\..+/, '')
    .replace(/:/g, '-'); // Format: YYYY-MM-DD_HH-MM-SS
  return timestamp;
}

const loggers: { [key: string]: pino.Logger } = {};

export class LocalLogger {
  logDirectory = defaultLogDirectory;
  public static instance: LocalLogger;

  constructor(logDirectory = defaultLogDirectory) {
    if (LocalLogger.instance) {
      return LocalLogger.instance; // Return the existing instance
    }

    this.logDirectory = logDirectory;

    // Ensure log directory exists
    jetpack.dir(this.logDirectory);

    // Schedule log cleanup every day at midnight
    this.scheduleLogCleanup();

    LocalLogger.instance = this; // Set the singleton instance
  }

  // Create a logger for a specific task
  createLogger(taskId: TaskTypes) {
    const timestamp = getTimestamp();
    const logFilePath = path.join(
      this.logDirectory,
      `task-${taskId}-${timestamp}.log`,
    );

    const fileTransport = pino.transport({
      target: 'pino/file',
      options: { destination: logFilePath },
    });

    if (loggers[taskId]) {
      return loggers[taskId];
    }

    const logger = pino(
      // {
      //   transport: {
      //     target: 'pino-pretty',
      //   },
      // },
      fileTransport,
    );

    loggers[taskId] = logger;

    return logger;
  }

  destroy(taskId: string) {
    if (loggers[taskId]) {
      loggers[taskId].flush();
      delete loggers[taskId];
    }
  }

  // Delete logs older than 5 days
  async deleteOldLogs() {
    const files = await jetpack.listAsync(this.logDirectory);
    const now = new Date().getTime();
    const fiveDays = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds

    if (!files) return;
    for (const file of files) {
      const filePath = path.join(this.logDirectory, file);
      const stats = await jetpack.inspectAsync(filePath, { times: true });

      if (stats && now - new Date(stats.modifyTime!).getTime() > fiveDays) {
        await jetpack.removeAsync(filePath);
        console.log(`Deleted old log file: ${filePath}`);
      }
    }
  }

  // Schedule the log deletion to run every day at midnight
  scheduleLogCleanup() {
    scheduleJob('0 0 * * *', () => {
      console.log('Running log cleanup task...');
      this.deleteOldLogs().catch((err) =>
        console.error('Error deleting old logs:', err),
      );
    });
  }
}

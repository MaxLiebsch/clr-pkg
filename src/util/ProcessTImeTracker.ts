import { MongoClient } from 'mongodb';
import { SAVE_USAGE_INTERVAL } from '../constants';
import { UTCDate } from '@date-fns/utc';

interface ActivityPeriod {
  [key: string]: { activeTime: number };
}

export class ProcessTimeTracker {
  private isActive: boolean = false;
  private crawlerId: string;
  private lastActiveTime: number = 0;
  private currenDate: Date = this.setToMidnightUTC(new UTCDate());
  private activityPeriods: Map<string, ActivityPeriod>;
  private taskType: string = 'DEFAULT';
  private mongoClient: Promise<MongoClient>;
  private interval: NodeJS.Timeout | number = 0;
  public initPromise: Promise<void>;
  public initialized: boolean = false;

  public static singelton: ProcessTimeTracker;

  public static getSingleton(
    crawlerId: string,
    mongoClient: Promise<MongoClient>,
  ): ProcessTimeTracker {
    if (!ProcessTimeTracker.singelton) {
      ProcessTimeTracker.singelton = new ProcessTimeTracker(
        crawlerId,
        mongoClient,
      );
    }
    return ProcessTimeTracker.singelton;
  }

  
  private setToMidnightUTC(date: Date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    return new UTCDate(Date.UTC(year, month, day, 23, 59, 59, 999));
  }
  
  constructor(crawlerId: string, mongoClient: Promise<MongoClient>) {
    this.crawlerId = crawlerId;
    this.activityPeriods = new Map();
    this.mongoClient = mongoClient;
    this.initPromise = this.init(); // Call init to load data from db
  }
  
  private getDate(date: Date) {
    return date.toISOString().split('T')[0];
  }
  
  private async init() {
    await this.loadFromDb();
    this.initialized = true;
  }

  private async handleSaveUsage() {
    await this.saveToDb();
  }

  markActive(taskType: string) {
    if (!this.isActive) {
      this.interval = this.intervalSave();
      this.taskType = taskType;
      const now = new UTCDate();
      const currDate = this.getDate(this.currenDate);
      const newDate = this.getDate(now);
      if (currDate !== newDate) {
        this.currenDate = this.setToMidnightUTC(now);
      }
      this.lastActiveTime = now.getTime();
      this.isActive = true;
    }
  }

  private handleUpdateUsage(now: Date){
    const newDate = this.getDate(now);
    const previousDate = this.getDate(this.currenDate);
    const activeTime = now.getTime() - this.lastActiveTime;
    if (newDate !== previousDate) {
      const overlap = now.getTime() - this.currenDate.getTime();
      const restOldDay = activeTime - overlap;
      if (this.activityPeriods.has(previousDate)) {
        const period = this.activityPeriods.get(previousDate);
        if (period![this.taskType]) {
          period![this.taskType].activeTime += restOldDay;
        } else {
          period![this.taskType] = { activeTime };
        }
        this.activityPeriods.set(previousDate, period!);
      }
      this.activityPeriods.set(newDate, {
        [this.taskType]: { activeTime: overlap },
      });
      this.currenDate = now;
    } else {
      if (this.activityPeriods.has(newDate)) {
        const period = this.activityPeriods.get(newDate);
        if (period![this.taskType]) {
          period![this.taskType].activeTime += activeTime;
        } else {
          period![this.taskType] = { activeTime };
        }
        this.activityPeriods.set(newDate, period!);
      } else {
        this.activityPeriods.set(newDate, {
          [this.taskType]: { activeTime },
        });
      }
    }
  }

  markInactive() {
    clearInterval(this.interval);
    if (this.isActive) {
      const now = new UTCDate();
      this.handleUpdateUsage(now)
      this.handleSaveUsage();
      this.lastActiveTime = now.getTime();
      this.isActive = false;
    }
  }

  set currentDate(date: Date) {
    this.currenDate = date;
  }

  get activeTime() {
    const now = new UTCDate();
    const date = this.getDate(now);
    const period = this.activityPeriods.get(date);
    return period?.activeTime ?? 0;
  }

  get activePeriods() {
    return this.activityPeriods;
  }

  private async loadFromDb() {
    const db = (await this.mongoClient).db();
    const collection = db.collection('metadata');
    const data = await collection.findOne({ crawlerId: this.crawlerId });
    if (data) {
      this.activityPeriods = new Map();
      const activityPeriods = data.activityPeriods;
      for (const date in activityPeriods) {
        if (activityPeriods.hasOwnProperty(date)) {
          this.activePeriods.set(date, activityPeriods[date]);
        }
      }
    }
  }

  private intervalSave() {
    return setInterval(async () => {
      if (this.isActive) {
        const now = new UTCDate();
        this.handleUpdateUsage(now);
        this.lastActiveTime = now.getTime();
      }
      await this.saveToDb();
    }, SAVE_USAGE_INTERVAL);
  }

  private filterRecentActivityPeriods(): Map<string, ActivityPeriod> {
    const now = new UTCDate();
    const sevenDaysAgo = new UTCDate(
      now.getTime() - 7 * 24 * 60 * 60 * 1000,
    ).getTime();

    return new Map(
      [...this.activityPeriods].filter(
        (date) => new UTCDate(date[0]).getTime() >= sevenDaysAgo,
      ),
    );
  }

  private async saveToDb() {
    const db = (await this.mongoClient).db();
    const collection = db.collection('metadata');
    const filteredRecentActivityPeriods = this.filterRecentActivityPeriods();
    await collection.updateOne(
      { crawlerId: this.crawlerId },
      {
        $set: {
          crawlerId: this.crawlerId,
          activityPeriods: filteredRecentActivityPeriods,
        },
      },
      { upsert: true },
    );
  }
}

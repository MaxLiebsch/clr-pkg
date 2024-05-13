export interface QueueTask {
  [key: string]: any;
  statistics: {
    errorTypeCount: {
      [key: string]: number;
    };
    resetedSession: number;
    browserStarts: number;
    openedPages: number;
  };
}

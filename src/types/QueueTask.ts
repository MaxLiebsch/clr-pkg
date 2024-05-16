export interface QueueTask {
  [key: string]: any;
  statistics: {
    errorTypeCount: {
      [key: string]: number;
    };
    retriesHeuristic: {
      "0": number;
      '1-9': number;
      '10-49': number;
      '50-99': number;
      '100-499': number;
      '500+': number;
    };
    resetedSession: number;
    browserStarts: number;
    openedPages: number;
  };
}

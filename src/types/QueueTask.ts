export interface QueueTask {
  [key: string]: any;
  productLimit: number;
  proxyType?: 'gb'| 'request';
  timezones?: string[];
  statistics: {
    errorTypeCount: {
      [key: string]: number;
    };
    estimatedProducts: number;
    statusHeuristic: {
      "error-handled": number;
      "page-completed": number;
      'not-found': number;
      "limit-reached": number;
      "total": number; 
    }
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
  };
}

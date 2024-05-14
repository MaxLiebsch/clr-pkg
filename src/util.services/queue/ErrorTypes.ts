export const errorTypes = {
  NavigatingFrameDetached: { count: 0, lastOccurred: null },
  RequestingMainFramTooEarly: { count: 0, lastOccurred: null },
  ERR_TIMED_OUT: { count: 0, lastOccurred: null },
  ERR_TUNNEL_CONNECTION_FAILED: { count: 0, lastOccurred: null },
  ERR_HTTP2_PROTOCOL_ERROR: { count: 0, lastOccurred: null },
  AccessDenied: { count: 0, lastOccurred: null },
  ServerError: { count: 0, lastOccurred: null },
  UnknowError: { count: 0, lastOccurred: null },
  RateLimit: { count: 0, lastOccurred: null },
  NotFound: { count: 0, lastOccurred: null }
};

export const errorTypeCount = {
  NavigatingFrameDetached: 0,
  RequestingMainFramTooEarly: 0,
  ERR_TIMED_OUT: 0,
  ERR_TUNNEL_CONNECTION_FAILED: 0,
  ERR_HTTP2_PROTOCOL_ERROR: 0,
  AccessDenied: 0,
  ServerError: 0,
  UnknowError: 0,
  RateLimit: 0,
  NotFound: 0,
};

export enum ErrorType {
  'NavigatingFrameDetached' = 'NavigatingFrameDetached',
  'RequestingMainFramTooEarly' = 'RequestingMainFramTooEarly',
  'ERR_TIMED_OUT' = 'ERR_TIMED_OUT',
  'ERR_TUNNEL_CONNECTION_FAILED' = 'ERR_TUNNEL_CONNECTION_FAILED',
  'ERR_HTTP2_PROTOCOL_ERROR' = 'ERR_HTTP2_PROTOCOL_ERROR',
  'AccessDenied' = 'AccessDenied',
  'ServerError' = 'ServerError',
  'UnknowError' = 'UnknowError',
  'RateLimit' = 'RateLimit',
  'NotFound' = 'NotFound',
}

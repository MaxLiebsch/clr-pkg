import { ErrorLog } from './isErrorFrequent';

export const errorLog: ErrorLog = {
  NavigatingFrameDetached: { count: 0, lastOccurred: null },
  RequestingMainFramTooEarly: { count: 0, lastOccurred: null },
  ERR_TIMED_OUT: { count: 0, lastOccurred: null },
  ERR_EMPTY_RESPONSE: { count: 0, lastOccurred: null },
  ERR_CONNECTION_CLOSED: { count: 0, lastOccurred: null },
  ERR_TUNNEL_CONNECTION_FAILED: { count: 0, lastOccurred: null },
  ERR_HTTP2_PROTOCOL_ERROR: { count: 0, lastOccurred: null },
  AccessDenied: { count: 0, lastOccurred: null },
  ServerError: { count: 0, lastOccurred: null },
  UnknowError: { count: 0, lastOccurred: null },
  RateLimit: { count: 0, lastOccurred: null },
  Timeout: { count: 0, lastOccurred: null },
  NotFound: { count: 0, lastOccurred: null },
  ProtocolError: { count: 0, lastOccurred: null },
  EanOnEbyNotFound: { count: 0, lastOccurred: null },
  Missing: {
    count: 0,
    lastOccurred: null,
  },
};

export const errorTypeCount: { [key in ErrorType]: number } = {
  NavigatingFrameDetached: 0,
  RequestingMainFramTooEarly: 0,
  ERR_TIMED_OUT: 0,
  ERR_EMPTY_RESPONSE: 0,
  ERR_TUNNEL_CONNECTION_FAILED: 0,
  ERR_HTTP2_PROTOCOL_ERROR: 0,
  ERR_CONNECTION_CLOSED: 0,
  AccessDenied: 0,
  ServerError: 0,
  UnknowError: 0,
  RateLimit: 0,
  Timeout: 0,
  NotFound: 0,
  ProtocolError: 0,
  Missing: 0,
  EanOnEbyNotFound: 0,
};

export type ErrorTypes =
  | 'NavigationFrameDetached'
  | 'RequestingMainFramTooEarly'
  | 'ERR_TIMED_OUT'
  | 'ERR_TUNNEL_CONNECTION_FAILED'
  | 'ERR_EMPTY_RESPONSE'
  | 'ERR_CONNECTION_CLOSED'
  | 'ERR_HTTP2_PROTOCOL_ERROR'
  | 'AccessDenied'
  | 'ServerError'
  | 'UnknowError'
  | 'RateLimit'
  | 'Timeout'
  | 'Missing'
  | 'NotFound'
  | 'ProtocolError'
  | 'EanOnEbyNotFound';

export enum ErrorType {
  'NavigatingFrameDetached' = 'NavigatingFrameDetached',
  'RequestingMainFramTooEarly' = 'RequestingMainFramTooEarly',
  'ERR_TIMED_OUT' = 'ERR_TIMED_OUT',
  'ERR_TUNNEL_CONNECTION_FAILED' = 'ERR_TUNNEL_CONNECTION_FAILED',
  'ERR_EMPTY_RESPONSE' = 'ERR_EMPTY_RESPONSE',
  'ERR_CONNECTION_CLOSED' = 'ERR_CONNECTION_CLOSED',
  'ERR_HTTP2_PROTOCOL_ERROR' = 'ERR_HTTP2_PROTOCOL_ERROR',
  'AccessDenied' = 'AccessDenied',
  'ServerError' = 'ServerError',
  'UnknowError' = 'UnknowError',
  'RateLimit' = 'RateLimit',
  'Timeout' = 'Timeout',
  'Missing' = 'Missing',
  'NotFound' = 'NotFound',
  'ProtocolError' = 'ProtocolError',
  'EanOnEbyNotFound' = 'EanOnEbyNotFound',
}

export interface ErrorLog {
  [key: string]: { count: number; lastOccurred: null | number };
}

export function isErrorFrequent(
  errorType: string,
  duration = 300000, // 5 minutes by default
  errorLog: ErrorLog,
) {
  const currentTime = Date.now();
  const lastOccurred = errorLog[errorType]?.lastOccurred;
  if (
    lastOccurred &&
    currentTime - lastOccurred < duration &&
    errorLog[errorType].count > 1
  ) {
    return true;
  }
  return false;
}

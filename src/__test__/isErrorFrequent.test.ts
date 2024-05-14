import { describe, expect, test } from '@jest/globals';
import { isErrorFrequent } from '../util/queue/isErrorFrequent';




describe('isErrorFrequent', () => {
    test('should return false when error is not frequent', () => {
        const errorTypes = {
          AccessDenied: {
            count: 1,
            lastOccurred: Math.floor(
              new Date('2024-05-09T14:23:45.154+00:00').getTime() / 1000,
            ),
          },
        };
        const duration = 60000;
        expect(isErrorFrequent('AccessDenied', duration, errorTypes)).toBe(false);
    });
    test('should return true when error is not frequent', () => {
        const errorTypes = {
            AccessDenied: {
              count: 1,
              lastOccurred: Math.floor(
                new Date('2024-05-09T14:23:45.154+00:00').getTime(),
              ),
            },
          };
        const duration = 30000;
        const date = new Date();
        date.setSeconds(date.getSeconds() - 29); 
        const lastOccurred = Math.floor(date.getTime());
        console.log('lastOccurred:', lastOccurred)
        errorTypes.AccessDenied.count += 1;
        errorTypes.AccessDenied.lastOccurred = lastOccurred
        expect(isErrorFrequent('AccessDenied', duration, errorTypes)).toBe(true);
    });
    test('should return true when currentTime - lastOccurred < 6 Minuten', () => {
        const errorTypes = {
            AccessDenied: {
              count: 1,
              lastOccurred: Math.floor(
                new Date('2024-05-09T14:23:45.154+00:00').getTime(),
              ),
            },
          };
        const duration = 6 * 60000;
        const date = new Date();
        date.setMinutes(date.getMinutes() - 5); 
        const lastOccurred = Math.floor(date.getTime());
        errorTypes.AccessDenied.count += 1;
        errorTypes.AccessDenied.lastOccurred = lastOccurred
        expect(isErrorFrequent('AccessDenied', duration, errorTypes)).toBe(true);
    });
});

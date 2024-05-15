import { describe, expect, test } from '@jest/globals';
import {
  screenResolutionsByPlatform,
  userAgentList,
} from '../constants';
import {
  averageNumberOfPagesPerSession,
  rotateScreenResolution,
  rotateUserAgent,
} from '../util/browser/getPage';

describe('rotation of useragent and viewport', () => {
  let currentUserAgent = 0;
  let currWinRes = 0;
  let currLinuxRes = 0;
  let currMacRes = 0;
  const userAgentListLength = userAgentList.length;
  const windowsResCnt = screenResolutionsByPlatform['Windows'].length;
  const linuxResCnt = screenResolutionsByPlatform['Linux'].length;
  const macResCnt = screenResolutionsByPlatform['macOS'].length;
  test('that it is nicely iterating over it', () => {
    Array.from({ length: 65}).map((item, i) => {
      let platform: 'Windows' | 'macOS' | 'Linux' = 'Windows';
      let navigatorPlatform: 'MacIntel' | 'Win32' | 'Linux x86_64' = 'Win32';
      if (i < averageNumberOfPagesPerSession) {
        const userAgent = rotateUserAgent(i);
        const { agent } = userAgent;
        expect(agent).toBe(userAgentList[0].agent);
        if (agent.includes('X11')) {
          platform = 'Linux';
          navigatorPlatform = 'Linux x86_64';
        }
        if (agent.includes('Macintosh')) {
          platform = 'macOS';
          navigatorPlatform = 'MacIntel';
        }
        const viewPort = rotateScreenResolution(platform, i);
        expect(viewPort.height).toBe(
          screenResolutionsByPlatform[platform][0].height,
        );
      } else {
        let currRes =
          platform === 'Windows'
            ? currWinRes
            : platform === 'Linux'
              ? currLinuxRes
              : currMacRes;
        currentUserAgent = (currentUserAgent + 1) % userAgentListLength;
        const userAgent = rotateUserAgent(i);
        const viewPort = rotateScreenResolution(platform, i);
        const { agent } = userAgent;
        expect(agent).toBe(userAgentList[currentUserAgent].agent);
        if (platform === 'Windows') {
          currRes = (currWinRes + 1) % windowsResCnt;
          currWinRes = currRes;
        } else if (platform === 'Linux') {
          currRes = (currLinuxRes + 1) % linuxResCnt;
          currLinuxRes = currRes;
        } else if (platform === 'macOS') {
          currRes = (currMacRes + 1) % macResCnt;
          currMacRes = currRes;
        }
        expect(viewPort.height).toBe(
            screenResolutionsByPlatform[platform][currRes].height,
        );
      }
    });
  });
});

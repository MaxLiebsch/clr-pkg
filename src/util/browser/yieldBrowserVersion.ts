import { CHROME_VERSIONS } from '../../constants';

export function* yieldBrowserVersion() {
  const versions = CHROME_VERSIONS;
  let index = 0;
  while (true) {
    yield versions[index];
    index = (index + 1) % versions.length
  }
}

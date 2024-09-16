export function getMainDomainFromUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const hostnameParts = parsedUrl.hostname.split('.');
    const mainDomain = hostnameParts.slice(-2).join('.');
    return mainDomain;
  } catch (error) {
    throw new Error(`Error parsing URL: ${url}`);
  }
}

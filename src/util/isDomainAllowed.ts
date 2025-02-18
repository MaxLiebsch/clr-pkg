export const isDomainAllowed = (url: string, allowedDomains: string[]) => {
  try {
    const parsedUrl = new URL(url);
    if (allowedDomains.some((domain) => parsedUrl.hostname.includes(domain))) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

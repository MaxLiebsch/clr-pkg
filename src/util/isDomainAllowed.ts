import allowed from '../static/allowed';

export const isDomainAllowed = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    if (allowed.some((domain) => parsedUrl.hostname.includes(domain))) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

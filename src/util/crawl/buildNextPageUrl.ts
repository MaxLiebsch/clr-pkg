export const buildNextPageUrl = (
  initialUrl: string,
  pageStr: string,
  page: number,
) => {
  if (initialUrl.includes('?')) {
    if (pageStr.includes('?')) {
      pageStr = pageStr.replace('?', '&');
    }
  }
  return  `${initialUrl}${pageStr}${page}`;
};

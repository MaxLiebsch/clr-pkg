export const parseEsinFromUrl = (url: string) => {
    try {
      if (url) {
        const esin = new URL(url).pathname.split("/")[2];
        if (esin) return esin;
      }
      return null;
    } catch (error) {
      return null;
    }
  };
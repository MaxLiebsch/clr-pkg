export const parseEbyCategories = (rawCategories: string[]) =>
  rawCategories.reduce((acc: number[], x: string) => {
    try {
      const prospectCategory = new URL(x).pathname.split('/')[3];
      if (parseInt(prospectCategory)) {
        acc.push(parseInt(prospectCategory));
      }
      return acc;
    } catch (e) {
      return acc;
    }
  }, []);

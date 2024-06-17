import { get } from 'lodash';

export const findProperty = (content: Array<any> | {}, path: string) => {
  if (content instanceof Array) {
    for (let index = 0; index < content.length; index++) {
      const value = get(content[index], path, null);
      if(value){
        return value
      }
    }
    return null;
  } else {
    return get(content, path, null);
  }
};

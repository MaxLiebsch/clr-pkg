import { Rule } from '../../types/rules';

export function shouldAbortRequest(requestUrl: string, rules: Rule[] | undefined) {
  if(!rules) return false;
  
  for (let rule of rules) {
    let allConditionsMet = rule.conditions.every((condition) => {
      switch (condition.type) {
        case 'endsWith':
          return requestUrl.endsWith(condition.value);
        case 'startsWith':
          return requestUrl.startsWith(condition.value);
        case 'includes':
          return requestUrl.includes(condition.value);
        case 'notIncludes':
          return !requestUrl.includes(condition.value);
        case 'regexMatch':
          const regex = new RegExp(condition.value);
          return regex.test(requestUrl);
        default:
          return false;
      }
    });

    if (allConditionsMet) {
      return true;
    }
  }
  return false;
}

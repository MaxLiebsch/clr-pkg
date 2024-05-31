export function safeJSONParse(str: string) {
  try {
    return JSON.parse(str);
  } catch (error) {
    return null;
  }
}

import { get } from 'lodash';
import { safeJSONParse } from './saveParseJSON';

/*
    * Extracts the text content of an element from an HTML string using a DOM parser
    
    * @param html - The HTML string to extract the text from
    * @param selector - The CSS selector of the element to extract the text from
    * @returns The text content of the element or null if the element was not found
    
    

*/

function extractTextWithDomParser(html: string, selector: string) {
  // Create a DOM parser
  const parser = new DOMParser();
  // Parse the HTML content
  const doc = parser.parseFromString(html, 'text/html');
  // Find the JSON-LD script tag
  const element = doc.querySelector(selector);
  // Return the JSON content
  return element ? element.textContent : null;
}

function extractTextFromJSONWithRegex(
  html: string,
  regex: string,
  path: string,
) {
  const jsonMatch = html.match(regex);
  // Check if a match was found
  if (jsonMatch && jsonMatch[1]) {
    // Parse the JSON string
    const jsonObject = safeJSONParse(jsonMatch[1].trim());
    if (jsonObject === null) return null;
    // Extract the gtin8 value
    const gtin8 = get(jsonObject[0], path, null);

    return gtin8;
  } else {
    return null;
  }
}

const parseElementFromBody = () => {};

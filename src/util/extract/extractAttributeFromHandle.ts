import { ElementHandle } from 'rebrowser-puppeteer';

export const extractAttributeElementHandle = async (
  elementHandle: ElementHandle,
  attributeType: string,
) => {
  try {
    const attribute = await elementHandle.evaluate((el, attributeType) => {
      const attribute = el.getAttribute(attributeType);
      return attribute ? el.getAttribute(attributeType) : null;
    }, attributeType);
    return attribute;
  } catch (error) {
    return null;
  }
};

export const attrFromEleInEleHandle = async (
  elementHandle: ElementHandle,
  element: string,
  attributeType: string,
) => {
  try {
    const attribute = await elementHandle.$eval(
      element,
      (i, attributeType) => i.getAttribute(attributeType),
      attributeType,
    );
    return attribute;
  } catch (error) {
    return null;
  }
};

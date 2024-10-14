import { Page } from "puppeteer1";
import { scrollToBottom } from "../../helpers";

export async function infinitSrollPgn({page}: {page: Page}){
    return await scrollToBottom(page);
}
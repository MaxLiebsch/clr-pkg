import { Page } from "rebrowser-puppeteer";
import { scrollToBottom } from "../../helpers";

export async function infinitSrollPgn({page}: {page: Page}){
    return await scrollToBottom(page);
}
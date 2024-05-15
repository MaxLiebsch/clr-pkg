import { Page as Page1 } from 'puppeteer1';
import { Page as Page2 } from 'puppeteer2';
import { Page as Page3 } from 'puppeteer3';

import { Browser as Browser1 } from 'puppeteer1';
import { Browser as Browser2 } from 'puppeteer2';
import { Browser as Browser3 } from 'puppeteer3';

import { ElementHandle as ElementHandle1 } from 'puppeteer1';
import { ElementHandle as ElementHandle2 } from 'puppeteer2';
import { ElementHandle as ElementHandle3 } from 'puppeteer3'

import { PuppeteerLifeCycleEvent as PuppeteerLifeCycleEvent1 } from 'puppeteer1';
import { PuppeteerLifeCycleEvent as PuppeteerLifeCycleEvent2 } from 'puppeteer2';
import { PuppeteerLifeCycleEvent as PuppeteerLifeCycleEvent3 } from 'puppeteer3';

import { TimeoutError as TimeoutError1 } from 'puppeteer1';
import { TimeoutError as TimeoutError2 } from 'puppeteer2';
import { TimeoutError as TimeoutError3 } from 'puppeteer3';

import { ResourceType as ResourceType1 } from 'puppeteer1';
import { ResourceType as ResourceType2 } from 'puppeteer2';
import { ResourceType as ResourceType3 } from 'puppeteer3';

export type Page = Page1 | Page2 | Page3;
export type ElementHandle = ElementHandle1 | ElementHandle2 | ElementHandle3;
export type Browser  = Browser1 | Browser2 | Browser3;
export type PuppeteerLifeCycleEvent = PuppeteerLifeCycleEvent1 | PuppeteerLifeCycleEvent2 | PuppeteerLifeCycleEvent3;
export type TimeoutError = TimeoutError1 | TimeoutError2 | TimeoutError3;
export type ResourceType = ResourceType1 | ResourceType2 | ResourceType3;

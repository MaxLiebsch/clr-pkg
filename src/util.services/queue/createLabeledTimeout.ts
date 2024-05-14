import { setTimeout } from "timers";

export function createLabeledTimeout(callback: any, delay: number, id: string) {
  const timeout = setTimeout(callback, delay);
  return { timeout, id };
}

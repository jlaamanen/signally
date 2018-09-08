import { writeFileSync, readdirSync, existsSync } from "fs";
import { resolve } from "path";
import { getCallerPackageRootPath } from "./utils";
import { bufferDirName } from "./config";

const bufferPath = resolve(getCallerPackageRootPath(), bufferDirName);

/**
 * Send an event by adding a new file in the buffer directory.
 * @param event Event name
 * @param messages Messages
 */
export function send(event: string, ...messages: string[]) {
  if (!existsSync(bufferPath)) {
    throw Error(`No signally listeners are running (${bufferPath} not found)`);
  }
  if (!existsSync(resolve(bufferPath, event))) {
    throw Error(`No signally listener found for event '${event}'`);
  }
  if (!event) {
    throw Error("Event must be defined");
  }
  const contents = JSON.stringify({ event, messages });
  const filename = getFirstAvailableFilename(event);
  writeFileSync(filename, contents);
}

/**
 * Gets first available buffer file name.
 * Starting from "1", tries to find the first available number as
 * the file name.
 */
function getFirstAvailableFilename(eventName: string) {
  let index = 1;
  let filename = "";
  const eventBufferPath = resolve(bufferPath, eventName);
  const files = readdirSync(eventBufferPath);
  do {
    filename = `${index++}`;
  } while (files.includes(filename));
  return resolve(eventBufferPath, filename);
}

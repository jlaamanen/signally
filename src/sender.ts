import { writeFileSync, readdirSync, existsSync } from "fs";
import { resolve } from "path";
import { getCallerPackageRootPath } from "./utils";
import { bufferDirName } from "./config";
import { SignallyError } from "./error";

const bufferPath = resolve(getCallerPackageRootPath(), bufferDirName);

/**
 * Send an event by adding a new file in the buffer directory.
 * @param eventName Event name
 * @param messages Messages
 */
export function send(eventName: string, ...messages: string[]) {
  if (!existsSync(bufferPath)) {
    throw SignallyError.BUFFER_ROOT_NOT_FOUND();
  }
  if (!existsSync(resolve(bufferPath, eventName))) {
    throw SignallyError.LISTENER_DOES_NOT_EXIST(eventName);
  }
  if (!eventName) {
    throw SignallyError.EVENT_NAME_NOT_DEFINED();
  }
  const filename = getFirstAvailableFilename(eventName);
  writeFileSync(filename, JSON.stringify(messages));
}

/**
 * Gets first available buffer file name.
 * Starting from "1", tries to find the first available number as
 * the file name.
 * @returns First available file name
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

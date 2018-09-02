import { writeFileSync, readdirSync, existsSync } from "fs";
import { bufferPath } from "./listener";
import { resolve } from "path";

/**
 * Send an event by adding a new file in the buffer directory.
 * @param event Event name
 * @param messages Messages
 */
export function send(event: string, ...messages: string[]) {
  if (!existsSync(bufferPath)) {
    throw Error(`No signally listeners are running (${bufferPath} not found)`);
  }
  if (!event) {
    throw Error("Event must be defined");
  }
  const contents = JSON.stringify({ event, messages });
  const filename = getFirstAvailableFilename();
  writeFileSync(filename, contents);
}

function getFirstAvailableFilename(index = 1, files = readdirSync(bufferPath)) {
  const filename = `${index}`;
  if (files.includes(filename)) {
    return getFirstAvailableFilename(index + 1, files);
  }
  return resolve(bufferPath, filename);
}

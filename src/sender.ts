import { writeFileSync, readdirSync, existsSync } from "fs";
import { queuePath } from "./listener";
import { resolve } from "path";

export function send(event: string, ...messages: string[]) {
  if (!existsSync(queuePath)) {
    throw Error(`No signally listeners are running (${queuePath} not found)`);
  }
  if (!event) {
    throw Error("Event must be defined");
  }
  const contents = JSON.stringify({ event, messages });
  const filename = getFirstAvailableFilename();
  writeFileSync(filename, contents);
}

function getFirstAvailableFilename(index = 1, files = readdirSync(queuePath)) {
  const filename = `${index}`;
  if (files.includes(filename)) {
    return getFirstAvailableFilename(index + 1, files);
  }
  return resolve(queuePath, filename);
}

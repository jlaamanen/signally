import { watch, unlinkSync, rmdirSync, FSWatcher } from "fs";
import { resolve } from "path";
import {
  clearDirectory,
  readJsonFile,
  getCallerPackageRootPath
} from "./utils";
import { bufferDirName } from "./config";

export const bufferPath = resolve(getCallerPackageRootPath(), bufferDirName);

let watcher: FSWatcher;
const listeners: Listener[] = [];

export interface Listener {
  event: string;
  callback: (...messages: string[]) => void;
}

export interface Message {
  event: string;
  messages: string[];
}

/**
 * Adds a listener for given event name.
 * When an event with given name is received, the callback is invoked
 * with the messages as arguments.
 * @param event Event name
 * @param callback Callback function
 */
export function addListener(
  event: string,
  callback: (...messages: string[]) => void
) {
  if (!event) {
    throw Error("Event must be defined");
  }
  if (!callback) {
    throw Error("Callback must be defined");
  }
  if (!watcher) {
    startWatcher();
  }
  listeners.push({ event, callback });
}

/**
 * Starts a file watcher for new signally events in buffer directory.
 */
function startWatcher() {
  clearDirectory(bufferPath);
  watcher = watch(bufferPath, (event, filename) => {
    const filePath = resolve(bufferPath, filename);
    const fileContents = readJsonFile<Message>(filePath);
    try {
      if (fileContents) {
        const { event, messages } = fileContents;
        listeners.forEach(listener => {
          if (listener.event === event) {
            listener.callback(...messages);
          }
        });
        unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error when handling event ${filename}:`, error);
    }
  });

  // Clean up on process exit
  process.on("exit", () => {
    watcher.close();
    clearDirectory(bufferPath);
    rmdirSync(bufferPath);
  });
}

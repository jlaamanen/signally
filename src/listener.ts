import { watch, unlinkSync, rmdirSync, FSWatcher, existsSync } from "fs";
import { resolve } from "path";
import {
  clearDirectory,
  readJsonFile,
  getCallerPackageRootPath
} from "./utils";
import { bufferDirName } from "./config";

export const bufferPath = resolve(getCallerPackageRootPath(), bufferDirName);

const watchers: { [eventName: string]: FSWatcher } = {};
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
  // TODO: event name validation
  if (!watchers[event]) {
    startWatcher(event);
  }
  listeners.push({ event, callback });
}

/**
 * Starts a file watcher for new signally events in buffer directory.
 */
function startWatcher(eventName: string) {
  if (!existsSync(bufferPath)) {
    clearDirectory(bufferPath);
  }
  const eventBufferPath = resolve(bufferPath, eventName);
  clearDirectory(eventBufferPath);
  watchers[eventName] = watch(eventBufferPath, (event, filename) => {
    const filePath = resolve(eventBufferPath, filename);
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
      console.error(
        `Error when handling event ${eventName} / ${filename}:`,
        error
      );
    }
  });

  // Clean up on process exit
  process.on("exit", () => {
    Object.values(watchers).forEach(watcher => {
      watcher.close();
    });
    clearDirectory(bufferPath);
    rmdirSync(bufferPath);
  });
}

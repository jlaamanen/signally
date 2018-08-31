import { watch, existsSync, unlinkSync, rmdirSync, FSWatcher } from "fs";
import { resolve } from "path";
import { clearDirectory, readJsonFile } from "./utils";

export const queuePath = resolve(".signally");

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

function startWatcher() {
  clearDirectory(queuePath);
  watcher = watch(queuePath, (event, filename) => {
    const filePath = resolve(queuePath, filename);
    if (existsSync(filePath)) {
      try {
        const { event, messages } = readJsonFile<Message>(filePath);
        listeners.forEach(listener => {
          if (listener.event === event) {
            listener.callback(...messages);
          }
        });
      } catch (error) {
        console.error(`Error when handling event ${filename}:`, error);
      }
      unlinkSync(filePath);
    }
  });

  // Clean up on process exit
  process.on("exit", () => {
    watcher.close();
    clearDirectory(queuePath);
    rmdirSync(queuePath);
  });
}

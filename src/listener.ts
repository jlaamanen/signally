import { watch, unlinkSync, FSWatcher, existsSync, rmdir } from "fs";
import { resolve } from "path";
import {
  clearDirectory,
  readJsonFile,
  getCallerPackageRootPath,
  rmdirRecursive,
  encodeEventName
} from "./utils";
import { bufferDirName } from "./config";
import { SignallyError } from "./error";

export const bufferPath = resolve(getCallerPackageRootPath(), bufferDirName);

type ListenerCallback = (...messages: string[]) => void;

interface EventListener {
  watcher: FSWatcher;
  callbacks: ListenerCallback[];
}

let listeners: {
  [eventName: string]: EventListener;
} = {};

/**
 * Adds a listener for given event name.
 * When an event with given name is received, the callback is invoked
 * with the messages as arguments.
 * @param eventName Event name
 * @param callback Callback function
 */
export function addListener(
  eventName: string,
  callback: (...messages: string[]) => void
) {
  if (!eventName) {
    throw SignallyError.EVENT_NAME_NOT_DEFINED();
  }
  if (!callback) {
    throw SignallyError.CALLBACK_NOT_DEFINED();
  }
  if (Object.entries(listeners).length === 0) {
    // Register clean up handler when adding first listener
    registerCleanUpHandler();
  }
  if (!listeners[eventName]) {
    // Start watcher for the event, if it doesn't yet exist
    listeners[eventName] = {
      watcher: startWatcher(eventName),
      callbacks: []
    };
  }
  listeners[eventName].callbacks.push(callback);
}

/**
 * Removes all listeners for given event name.
 * @param eventName
 */
export function removeListeners(eventName: string) {
  if (!listeners[eventName]) {
    throw SignallyError.LISTENER_DOES_NOT_EXIST(eventName);
  }
  listeners[eventName].watcher.close();
  rmdirRecursive(resolve(bufferPath, encodeEventName(eventName)));
  delete listeners[eventName];
}

/**
 * Removes all Signally listeners and cleans up the buffer directory.
 */
export function removeAllListeners() {
  Object.values(listeners).forEach(listener => {
    listener.watcher.close();
  });
  rmdirRecursive(bufferPath);
  listeners = {};
}

/**
 * Starts a file watcher for new signally events in buffer directory.
 * @param eventName Event name
 * @returns File watcher for the event
 */
function startWatcher(eventName: string) {
  if (!existsSync(bufferPath)) {
    clearDirectory(bufferPath);
  }
  const eventBufferPath = resolve(bufferPath, encodeEventName(eventName));
  clearDirectory(eventBufferPath);
  return watch(eventBufferPath, (_, filename) => {
    const filePath = resolve(eventBufferPath, filename);
    const messages = readJsonFile<string[]>(filePath);
    if (messages) {
      listeners[eventName].callbacks.forEach(callback => {
        callback(...messages);
      });
      unlinkSync(filePath);
    }
  });
}

/**
 * Registers a clean-up function on process exit.
 * Stops file watchers and cleans up buffer directories.
 */
function registerCleanUpHandler() {
  process.on("exit", () => {
    removeAllListeners();
  });
}

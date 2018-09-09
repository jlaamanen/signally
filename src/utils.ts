import {
  existsSync,
  readdirSync,
  lstatSync,
  unlinkSync,
  rmdirSync,
  mkdirSync,
  readFileSync
} from "fs";
import { resolve, parse } from "path";
import { SignallyError } from "./error";

/**
 * Removes directory and all subdirectories recursively with given path.
 * @param path Directory path
 */
export function rmdirRecursive(path: string) {
  if (existsSync(path)) {
    readdirSync(path).forEach(file => {
      const currentPath = resolve(path, file);
      if (lstatSync(currentPath).isDirectory()) {
        rmdirRecursive(currentPath);
      } else {
        unlinkSync(currentPath);
      }
    });
    rmdirSync(path);
  }
}

/**
 * Removes given directory and its subdirectories, and creates a new
 * directory.
 * @param path Directory path
 */
export function clearDirectory(path: string) {
  rmdirRecursive(path);
  mkdirSync(path);
}

/**
 * If given path exists, reads the file contents and parses it from JSON.
 * If path doesn't exist or file is empty, returns undefined.
 * @param path File path
 * @returns File contents parsed from JSON
 */
export function readJsonFile<T extends object = object>(path: string) {
  if (!existsSync(path)) {
    return undefined;
  }
  const file = readFileSync(path);
  // If buffer is empty, the file is not yet ready to be read
  return file.length > 0 ? <T>JSON.parse(file.toString()) : undefined;
}

/**
 * Gets the npm package root path of the caller.
 * First finds the caller path from stack, then tries to
 * find the first up directory containing package.json.
 * @returns Package root path of calling package
 */
export function getCallerPackageRootPath() {
  const stack = getStack();
  if (stack.length < 4) {
    // Should never happen, but throw an error just in case
    throw SignallyError.CALLER_STACK_TOO_SMALL();
  }
  // 4th item on the stack gives us the caller of the caller of this function
  const caller = getStack()[3];
  return findPackageRoot(caller.getFileName());
}

/**
 * Gets the call stack from Error.
 * @returns Stack of callsites
 */
export function getStack() {
  // Temporarily override Error.prepareStackTrace to get access to CallSites
  const originalPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const error = new Error();
  const stack: NodeJS.CallSite[] = <any>error.stack;
  Error.prepareStackTrace = originalPrepareStackTrace;
  stack.shift();
  return stack;
}

/**
 * Recursively tries to find an up directory containing package.json.
 * @param path Starting path
 * @returns Node package root for given path
 */
export function findPackageRoot(path: string): string {
  if (path === parse(resolve("")).root) {
    throw SignallyError.PACKAGE_ROOT_NOT_FOUND();
  }
  if (existsSync(resolve(path, "packages.json"))) {
    return path;
  }
  return findPackageRoot(resolve(path, ".."));
}

/**
 * Encodes the event name to buffer directory name.
 * Alias for encodeURIComponent for now.
 * @param eventName Event name
 * @returns Encoded buffer directory name
 */
export function encodeEventName(eventName: string) {
  return encodeURIComponent(eventName);
}

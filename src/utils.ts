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
 */
export function getCallerPackageRootPath() {
  const stack = getStack();
  if (stack.length < 4) {
    // Should never happen, but throw an error just in case
    throw Error("Could not get caller path from stack");
  }
  // 4th item on the stack gives us the caller of the caller of this function
  const caller = getStack()[3];
  return findPackageRoot(caller.getFileName());
}

/**
 * Gets the call stack from Error.
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
 */
export function findPackageRoot(path: string) {
  const { root } = parse(resolve(""));
  if (path === root) {
    throw Error(`Could not find the package root containing package.json`);
  }
  if (existsSync(resolve(path, "package.json"))) {
    return path;
  }
  return findPackageRoot(resolve(path, ".."));
}

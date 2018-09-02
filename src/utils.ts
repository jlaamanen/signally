import {
  existsSync,
  readdirSync,
  lstatSync,
  unlinkSync,
  rmdirSync,
  mkdirSync,
  readFileSync
} from "fs";
import { resolve } from "path";

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

export function clearDirectory(path: string) {
  rmdirRecursive(path);
  mkdirSync(path);
}

export function readJsonFile<T extends object = object>(path: string) {
  if (!existsSync(path)) {
    return undefined;
  }
  const file = readFileSync(path);
  // If buffer is empty, the file is not yet ready
  return file.length > 0 ? <T>JSON.parse(file.toString()) : undefined;
}

export function getModuleRootPath() {
  return resolve(__dirname, "..");
}

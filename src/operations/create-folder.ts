import { mkdirSync, rmSync, statSync } from "fs";

export function createFolder(path: string, recreate: boolean = false) {
  if (recreate && statSync(path, { throwIfNoEntry: false })?.isDirectory()) {
    rmSync(path, { recursive: true });
  }
  mkdirSync(path, { recursive: true });
  return path;
}

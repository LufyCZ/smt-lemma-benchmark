import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  realpathSync,
  statSync,
} from "fs";

function folderExists(path: string) {
  return statSync(path, { throwIfNoEntry: false })?.isDirectory();
}

export function copySourceFormulas(source: string, target: string) {
  if (!folderExists(source)) {
    throw new Error(`Source folder does not exist: ${source}`);
  }

  if (!folderExists(target)) {
    mkdirSync(target, { recursive: true });
  }

  source = realpathSync(source);
  target = realpathSync(target);

  const sourceContents = readdirSync(source);
  sourceContents.forEach((file) => {
    copyFileSync(`${source}/${file}`, `${target}/${file}`);
  });
}

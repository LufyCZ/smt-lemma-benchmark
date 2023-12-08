import { spawn } from "child_process";
import { readdirSync, statSync } from "fs";

export async function unzipall(dir: string) {
  return Promise.all(
    readdirSync(dir).flatMap((folder) => {
      if (!statSync(`${dir}/${folder}`).isDirectory()) return;
      readdirSync(`${dir}/${folder}`).flatMap((file) => {
        if (file.endsWith(".bz2")) {
          const path = `${dir}/${folder}/${file}`;
          return new Promise((res) => {
            const proc = spawn("bzip2", ["-d", path]);

            proc.on("exit", () => {
              res(path);
            });
          });
        }
      });
    })
  );
}

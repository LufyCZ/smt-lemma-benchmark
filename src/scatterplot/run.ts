import { spawn } from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";

export interface RunScatterplot {}

const currentDir = dirname(fileURLToPath(import.meta.url));

export async function runScatterplot(job: RunScatterplot) {
  const childProcess = spawn("python", [`${currentDir}/scatterplot.py`]);

  childProcess.stdout?.on("data", (data: Buffer) => {
    const line = data.toString();
    console.log(line);
  });

  childProcess.stderr?.on("data", (data: Buffer) => {
    console.log(data.toString());
  });

  return new Promise<void>((resolve, reject) => {
    childProcess.on("exit", (e) => {
      childProcess.kill("SIGKILL");
      resolve();
    });

    childProcess.on("error", (err) => {
      console.log("err", err);
      reject(err);
    });

    childProcess.on("message", (res) => {
      childProcess.kill("SIGKILL");
      resolve();
    });
  });
}

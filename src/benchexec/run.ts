import { spawn } from "child_process";
import { mkdirSync, realpathSync, statSync } from "fs";

interface Benchexec {
  xmlFile: string;
  threads: number;
  resDir: string;
}

export async function benchexec({ xmlFile, threads, resDir }: Benchexec) {
  if (!statSync(resDir, { throwIfNoEntry: false })?.isDirectory()) {
    mkdirSync(resDir, { recursive: true });
    console.log("created directory", realpathSync(resDir));
  }

  const command = `--numOfThreads ${threads} ${realpathSync(
    xmlFile
  )} --read-only-dir / --overlay-dir /home -o ${realpathSync(resDir)}`;

  console.log(command);

  const proc = spawn("benchexec", command.split(" "));
  return new Promise<void>((res) => {
    // proc.stdout.on("data", (data) => {
    //   console.log(data);
    // });

    proc.stdout.on("data", (data) => {
      console.log(data.toString());
    });
    proc.on("exit", () => res());
  });
}

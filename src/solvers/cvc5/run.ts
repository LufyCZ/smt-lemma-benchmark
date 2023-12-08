import { fork, spawn } from "child_process";
import { rmSync, writeFileSync } from "fs";
import * as url from "url";

export interface RunCVC5 {
  title?: string;
  // config: Z3Config;
  timeout: number;
  lemmas?: boolean;
  benchmark: string;
}

export type RunCVC5Result = Awaited<ReturnType<typeof runCVC5Worker>> & {
  lemmas: string[];
};

const results = ["sat", "unsat", "unknown"] as const;
type Result = (typeof results)[number];

function checkParentesis(line: string) {
  if (line.endsWith(")")) {
    return false;
  }

  let count = 0;
  for (const char of line) {
    if (char === "(") {
      count++;
    } else if (char === ")") {
      count--;
    }
  }
  return count === 0;
}

export async function runCVC5(job: RunCVC5) {
  const childProcess = fork("./src/solvers/cvc5/worker.mts", [], {
    silent: job.lemmas,
  });
  childProcess.send(job);

  let lemmas: string[] = [];
  let currLemma = "";
  childProcess.stdout?.on("data", (data: Buffer) => {
    let line = data.toString();

    if (checkParentesis(currLemma)) {
      if (!currLemma.includes("INT_DIV_BY_ZERO")) {
        lemmas.push(currLemma);
      }
      currLemma = "";
    }

    currLemma += line;
  });

  return new Promise<RunCVC5Result>((r) => {
    childProcess.on("exit", (e) => {
      console.log("exit");
    });

    childProcess.on("error", (err) => {
      console.log("rrorr");
      throw err;
    });

    childProcess.on("message", (res) => {
      console.log("msg");
      childProcess.kill();

      r({ ...JSON.parse(res.toString()), lemmas });
    });
  });
}

export async function runCVC5Worker({
  title,
  // config,
  timeout,
  lemmas,
  benchmark,
}: RunCVC5) {
  const cvc5path = `cvc5`;

  writeFileSync("./temp", benchmark);

  const startTime = performance.now();
  const result = await new Promise<Result>((resolve) => {
    let opts: string[] = [];
    opts.push("--lang", "smt2");
    opts.push("--tlimit", String(timeout));
    if (lemmas) {
      opts.push("--output=learned-lits");
    }
    opts.push("./temp");

    const child_process = spawn(cvc5path, opts);

    child_process.stdout?.on("data", (data: Buffer) => {
      const line = data.toString();
      const lineWithoutNL = line.substring(0, line.lastIndexOf("\n"));
      if (results.map((r) => `${r}\n`).includes(line)) {
        child_process.kill();
        resolve(lineWithoutNL as Result);
      } else {
        process.stdout.write(data);
      }
    });

    child_process.on("exit", (d) => {
      resolve("unknown");
    });
  });
  const endTime = performance.now();

  rmSync("./temp");

  return {
    title,
    // config,
    time: endTime - startTime,
    result,
  };
}

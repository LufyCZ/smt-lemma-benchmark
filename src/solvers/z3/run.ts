import { init } from "z3-solver";
import { Z3Config, setZ3Config } from "./config.js";
import { fork } from "child_process";

export interface RunZ3 {
  title?: string;
  config: Z3Config;
  timeout: number;
  lemmas?: boolean;
  benchmark: string;
}

export type RunZ3Result = Awaited<ReturnType<typeof runZ3Worker>> & {
  lemmas: string[];
};

function outputToLemmas(output: string) {
  const lemmas = output
    .split("(assert")
    .slice(1)
    .map((a) => "(assert" + a)
    .slice(0, -1);

  return lemmas;
}

export async function runZ3(job: RunZ3) {
  const childProcess = fork("./src/solvers/z3/worker.mts", [], {
    silent: job.lemmas,
  });
  childProcess.send(job);

  let output = "";
  childProcess.stdout?.on("data", (data: Buffer) => {
    const line = data.toString();

    output += line;
  });

  childProcess.stderr?.on("data", (data: Buffer) => {
    console.log(data.toString());
  });

  return new Promise<RunZ3Result>((resolve, reject) => {
    childProcess.on("exit", (e) => {
      childProcess.kill("SIGKILL");
      resolve({
        title: job.title,
        result: "exited",
        time: job.timeout * 2,
        config: job.config,
        lemmas: outputToLemmas(output),
      });
    });

    childProcess.on("error", (err) => {
      console.log("err", err);
      reject(err);
    });

    childProcess.on("message", (res) => {
      childProcess.kill("SIGKILL");
      resolve({
        ...JSON.parse(res.toString()),
        lemmas: outputToLemmas(output),
      });
    });

    setTimeout(() => {
      childProcess.kill("SIGKILL");
      resolve({
        title: job.title,
        result: "timeout",
        time: job.timeout * 2,
        config: job.config,
        lemmas: outputToLemmas(output),
      });
    }, job.timeout * 2);
  });
}

export async function runZ3Worker({
  title,
  config,
  timeout,
  lemmas,
  benchmark,
}: RunZ3) {
  const { Context, Z3 } = await init();

  const ctx = Context("main");

  const { Solver } = ctx;
  const solver = new Solver();

  // Z3.global_param_set("pp.no-lets", "true");

  solver.set("timeout", timeout);
  solver.set("lemmas2console", lemmas);
  setZ3Config(solver, config);

  solver.fromString(benchmark);

  const startTime = performance.now();
  const result = await solver.check();
  const endTime = performance.now();

  return {
    title,
    config,
    time: endTime - startTime,
    result: result as typeof result | "timeout" | "exited",
  };
}

// 1. CVC5
//   --output=learned-lits
// 2. Unletter ✅
// 3. 1000 last lemmat, new file, add lemmas ✅

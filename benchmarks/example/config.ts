import { dirname } from "path";
import {
  BenchmarkConfig,
  allBenchmarkTypes,
  liaConfigs,
  niaConfigs,
} from "../../src/types.js";
import { fileURLToPath } from "url";
import {
  TakeLemmaTypes,
  takeLemmaTypes,
  TakeLeastVariables,
  takeLeastVariablesLemmas,
  takeLongestLemmas,
  TakeLongest,
} from "../../src/lemmas/processing/index.js";

const currentDir = dirname(fileURLToPath(import.meta.url));

export const config: BenchmarkConfig = {
  // For only stock-z3 and z3-lemmas-z3 runs, use ["stock-z3", "z3-lemmas-z3"]
  benchmarkTypes: allBenchmarkTypes,
  arithConfigs: ["lia", "nia"],
  benchmarkConfigs: {
    // For all lia configs, use "liaConfigs"
    lia: ["lia1", "lin"],
    // For all nia configs, use "niaConfigs"
    nia: ["no-dio", "nia1-6"],
  },
  // A relative path to the directory containing the source formulas
  sourceDirectory: currentDir + "/stock",
  benchexec: {
    memory: "2048MB",
    threads: 12,
    timeout: "10s",
    hardTimeout: "15s",
  },
  lemmas: {
    // Time in milliseconds
    genTime: 2500,
    // An array of operations to perform on the lemmas
    // Unfortunately untyped, gotta match the opts manually / specify the type
    ops: [
      {
        fn: takeLemmaTypes,
        opts: {
          types: [":internal", ":preprocess", ":preprocess_solved"],
        } as TakeLemmaTypes,
      },
      { fn: takeLongestLemmas, opts: { count: 1000 } as TakeLongest },
      {
        fn: takeLeastVariablesLemmas,
        opts: { count: 200 } as TakeLeastVariables,
      },
    ],
  },
  // A short description of the benchmark, is only used for the result markdown
  notes: "Take longest 1000 lemmas, pick 200 with the shortest lemmas",
  // Where to store the formulas and results
  directory: currentDir,
};

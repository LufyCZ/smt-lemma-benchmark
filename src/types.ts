import { type processLemmas } from "./lemmas/processing/process.js";

export const lemmaBenchmarkTypes = [
  "z3-lemmas-cvc5",
  "z3-lemmas-z3",
  "cvc5-lemmas-cvc5",
  "cvc5-lemmas-z3",
] as const;

export const stockBenchmarkTypes = ["stock-cvc5", "stock-z3"] as const;

export const allBenchmarkTypes = [
  ...lemmaBenchmarkTypes,
  ...stockBenchmarkTypes,
] as const;

export type LemmaBenchmarkType = (typeof lemmaBenchmarkTypes)[number];
export type StockBenchmarkType = (typeof stockBenchmarkTypes)[number];
export type BenchmarkType = (typeof allBenchmarkTypes)[number];

export type BenchmarkName = string;
export type ConfigType = string;

export type Config = "lia" | "nia";
export type Status = "sat" | "unsat" | "timeout" | "error";

export const liaConfigs = [
  "def",
  "eq1",
  "eq2",
  "lia1-6",
  "lia1",
  "lia2-6",
  "lia2",
  "lin",
  "no-dio",
  "q",
] as const;
export type LiaConfig = (typeof liaConfigs)[number];
export const niaConfigs = [
  "def",
  "eq1",
  "eq2",
  "nia1-6",
  "nia2-6",
  "no-dio",
  "nonlin",
] as const;
export type NiaConfig = (typeof niaConfigs)[number];

export type Benchmarks = Map<
  BenchmarkName,
  Map<ConfigType, Map<BenchmarkType, { status: Status; cputime: number }>>
>;
export type RelevantBenchmarks = Map<
  string,
  Map<BenchmarkType, { status: Status; cputime: number }>
>;

export type BenchmarkConfig = {
  benchmarkTypes: Readonly<BenchmarkType[]>;
  arithConfigs: Config[];
  benchmarkConfigs: {
    lia: Readonly<LiaConfig[]>;
    nia: Readonly<NiaConfig[]>;
  };
  sourceDirectory: string;
  lemmas: {
    ops: Parameters<typeof processLemmas>[1];
    genTime: number;
  };
  benchexec: {
    timeout: `${number}s`;
    hardTimeout: `${number}s`;
    threads: number;
    memory: string;
  };
  directory: string;
  notes?: string;
};

import { type } from "os";
import { BenchmarkType, RelevantBenchmarks } from "../types";

type Result = number;

type ResultAgg = Partial<
  Record<BenchmarkType, Result>
>;

export function addRuntimes(base: ReturnType<typeof getRuntimes>, toAdd: ReturnType<typeof getRuntimes>) {
  Object.entries(toAdd).forEach(([type, runtime]) => {
    base[type as BenchmarkType] = (base[type as BenchmarkType] || 0) + runtime;
  })

  return base;
}

export function getRuntimes(benchmarks: RelevantBenchmarks) {
  let runtimes: ResultAgg = {};

  benchmarks.forEach((types) => {
    types.forEach((result, type) => {
      runtimes[type] = runtimes[type] || 0;
      runtimes[type]! += result.cputime;
    });
  });

  return runtimes;
}

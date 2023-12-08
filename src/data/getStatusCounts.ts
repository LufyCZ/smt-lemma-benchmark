import { RelevantBenchmarks } from "../types.js";

export function addStatusCounts(
  base: ReturnType<typeof getStatusCounts>,
  toAdd: ReturnType<typeof getStatusCounts>
) {
  return {
    errorCount: base.errorCount + toAdd.errorCount,
    satCount: base.satCount + toAdd.satCount,
    unsatCount: base.unsatCount + toAdd.unsatCount,
    timeoutCount: base.timeoutCount + toAdd.timeoutCount,
  };
}

export function getStatusCounts(benchmarks: RelevantBenchmarks) {
  const errorCount = Array.from(benchmarks.values()).reduce(
    (acc, cur) =>
      acc +
      Array.from(cur.values()).reduce(
        (acc, cur) => (acc += cur.status === "error" ? 1 : 0),
        0
      ),
    0
  );
  const timeoutCount = Array.from(benchmarks.values()).reduce(
    (acc, cur) =>
      acc +
      Array.from(cur.values()).reduce(
        (acc, cur) => (acc += cur.status === "timeout" ? 1 : 0),
        0
      ),
    0
  );
  const satCount = Array.from(benchmarks.values()).reduce(
    (acc, cur) =>
      acc +
      Array.from(cur.values()).reduce(
        (acc, cur) => (acc += cur.status === "sat" ? 1 : 0),
        0
      ),
    0
  );
  const unsatCount = Array.from(benchmarks.values()).reduce(
    (acc, cur) =>
      acc +
      Array.from(cur.values()).reduce(
        (acc, cur) => (acc += cur.status === "unsat" ? 1 : 0),
        0
      ),
    0
  );

  return {
    errorCount,
    timeoutCount,
    satCount,
    unsatCount,
  };
}

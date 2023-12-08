interface TakeLeastVariablesNumber {
  count: number;
  percentage: never;
}

interface TakeLeastVariablesPercentage {
  percentage: number;
  count: never;
}

export type TakeLeastVariables =
  | TakeLeastVariablesNumber
  | TakeLeastVariablesPercentage;

export function takeLeastVariablesLemmas(
  lemmas: string[],
  { count, percentage }: TakeLeastVariables
) {
  const arr: { lemma: string; varCount: number }[] = [];

  for (const lemma of lemmas) {
    const variables = lemma.match(/x\d+/g) ?? [];
    arr.push({
      lemma,
      varCount: variables.length,
    });
  }

  const sorted = arr.sort((a, b) => a.varCount - b.varCount);
  const reduced = sorted.map((a) => a.lemma);

  if (count) {
    return reduced.slice(-count);
  } else if (percentage) {
    const index = Math.floor((reduced.length / 100) * percentage);
    return reduced.slice(-index);
  } else {
    throw new Error("Invalid arguments");
  }
}

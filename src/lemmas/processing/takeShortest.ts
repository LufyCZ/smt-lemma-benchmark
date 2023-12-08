interface TakeShortestNumber {
  count: number;
  percentage: never;
}

interface TakeShortestPercentage {
  percentage: number;
  count: never;
}

export type TakeShortest = TakeShortestNumber | TakeShortestPercentage;

export function takeShortestLemmas(
  lemmas: string[],
  { count, percentage }: TakeShortest
) {
  const sorted = lemmas.sort((a, b) => a.length - b.length);

  if (count) {
    return sorted.slice(0, count);
  } else if (percentage) {
    const index = Math.floor((sorted.length / 100) * percentage);
    return sorted.slice(0, index);
  } else {
    throw new Error("Invalid arguments");
  }
}

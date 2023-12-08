export type TakeMostCompsPerChar = {
  count: number;
};

export function takeMostCompsPerChar(
  lemmas: string[],
  { count }: TakeMostCompsPerChar
) {
  const ratings: { lemma: string; rating: number }[] = [];

  for (const lemma of lemmas) {
    let compCount = 0;

    lemma.split("").forEach((char) => {
      if (char === "<") compCount++;
      if (char === ">") compCount++;
    });

    ratings.push({ lemma, rating: compCount / lemma.length });
  }

  const sorted = ratings.sort((a, b) => b.rating - a.rating);

  return sorted.slice(0, count).map((r) => r.lemma);
}

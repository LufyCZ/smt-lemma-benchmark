export interface TakeLemmaTypes {
  types: (":preprocess" | ":preprocess_solved" | ":internal")[];
}

export function takeLemmaTypes(lemmas: string[], { types }: TakeLemmaTypes) {
  if (!lemmas[0].includes(":")) {
    return lemmas;
  }

  return lemmas.filter((lemma) => types.some((type) => lemma.includes(type)));
}

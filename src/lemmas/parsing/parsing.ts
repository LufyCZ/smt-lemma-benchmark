export const removeCheckSat = (benchmark: string) => {
  if (benchmark.indexOf("(check-sat)") === -1) {
    return benchmark;
  }

  return benchmark.replace("(check-sat)", "");
};

export const removeExit = (benchmark: string) => {
  if (benchmark.indexOf("(exit)") === -1) {
    return benchmark;
  }

  return benchmark.replace("(exit)", "");
};

export const addCheckSat = (benchmark: string) => {
  if (benchmark.indexOf("(check-sat)") !== -1) {
    return benchmark;
  }

  return benchmark + "\n(check-sat)";
};

export const addExit = (benchmark: string) => {
  if (benchmark.indexOf("(exit)") !== -1) {
    return benchmark;
  }

  return benchmark + "\n(exit)";
};

export const addLemmas = (benchmark: string, lemmas: string[]) => {
  benchmark = removeCheckSat(benchmark);
  benchmark = removeExit(benchmark);
  benchmark += lemmas.join("\n");
  benchmark = addCheckSat(benchmark);
  benchmark = addExit(benchmark);

  return benchmark;
};

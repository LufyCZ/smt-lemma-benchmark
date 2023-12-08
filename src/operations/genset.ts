import { realpathSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { BenchmarkConfig, LiaConfig, NiaConfig } from "../types";
import { dirname } from "path";
import { fileURLToPath } from "url";

const configDir = dirname(fileURLToPath(import.meta.url))
  .split("/")
  .slice(0, -1)
  .join("/");

const configs = {
  "cvc5-lia": `${configDir}/benchexec/configs/cvc5-lia.xml`,
  "cvc5-nia": `${configDir}/benchexec/configs/cvc5-nia.xml`,
  "z3-lia": `${configDir}/benchexec/configs/z3-lia.xml`,
  "z3-nia": `${configDir}/benchexec/configs/z3-nia.xml`,
};

interface Genset {
  cfg: keyof typeof configs;
  benchexecConfig: BenchmarkConfig["benchexec"];
  benchmarkConfig: Readonly<LiaConfig[] | NiaConfig[]>;
  dir: string;
}

export function genset({ cfg, benchexecConfig, benchmarkConfig, dir }: Genset) {
  const selconfig = configs[cfg];

  if (!selconfig) {
    throw new Error("Invalid config");
  }

  const realpath = realpathSync(dir);
  const dircontents = readdirSync(realpath);

  let config = readFileSync(selconfig, "utf8").split("\n");

  let prevStart = 0;
  let prevEnd = 0;

  while (true) {
    const startIndex = config.findIndex(
      (line, i) =>
        line.includes("<rundefinition") &&
        !line.includes("defines") &&
        i > prevStart
    );
    const endIndex = config.findIndex(
      (line, i) => line.includes("</rundefinition") && i > prevEnd
    );

    prevStart = startIndex;
    prevEnd = endIndex;

    if (startIndex === -1 || endIndex === -1) {
      break;
    }

    if (
      !benchmarkConfig.some((cfg) =>
        config[startIndex].includes(`name="${cfg}"`)
      )
    ) {
      config = [...config.slice(0, startIndex), ...config.slice(endIndex + 1)];
    }
  }

  const tasksStartIndex = config.reduce<number>((res, line, i) => {
    if (line.includes("<tasks")) {
      return i;
    }

    return res;
  }, -1);
  const tasksEndIndex = config.reduce<number>((res, line, i) => {
    if (line.includes("</tasks")) {
      return i;
    }

    return res;
  }, -1);

  const tasksStart = config.slice(0, tasksStartIndex + 1);
  const tasksEnd = config.slice(tasksEndIndex);

  let result = [
    ...tasksStart,
    `     <includesfile>${realpath}/set.set</includesfile>`,
    ...tasksEnd,
  ].join("\n");

  result = result.replace(
    `timelimit="10s"`,
    `timelimit="${benchexecConfig.timeout}"`
  );
  result = result.replace(
    `hardtimelimit="20s"`,
    `hardtimelimit="${benchexecConfig.hardTimeout}"`
  );

  writeFileSync(`${realpath}/config.xml`, result);

  const set = dircontents
    .filter((file) => file.includes(".smt2"))
    .map((file) => `${realpath}/${file}`);

  writeFileSync(`${realpath}/set.set`, set.join("\n"));
}

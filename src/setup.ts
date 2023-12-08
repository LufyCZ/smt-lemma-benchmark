import { writeFileSync, appendFileSync } from "fs";
import { benchexec } from "./benchexec/run.js";
import { createLemmaFiles } from "./operations/create-lemma-files.js";
import { genset } from "./operations/genset.js";
import { readxmls } from "./operations/readxmls.js";
import { unzipall } from "./operations/unzip.js";
import {
  Benchmarks,
  RelevantBenchmarks,
  StockBenchmarkType,
  stockBenchmarkTypes,
} from "./types.js";
import { addStatusCounts, getStatusCounts } from "./data/getStatusCounts.js";
import {
  getAllLemmaXStockScatterPlot,
  getLemmaXStockScatterPlot,
  getScatterPlotPerms,
} from "./scatterplot/get.js";
import {
  addBetterCounts,
  getBetterCountPerms,
} from "./data/getBetterCounts.js";
import { mdStatusCounts } from "./markdown/statusCounts.js";
import { mdPlots } from "./markdown/plots.js";
import { mdBetterCounts } from "./markdown/betterCounts.js";
import { parseStatus } from "./benchexec/parseStatus.js";
import { createFolder } from "./operations/create-folder.js";
import { copySourceFormulas } from "./operations/copy-source-formulas.js";
import {
  addSolvedCounts,
  getSolvedCountsPerms,
} from "./data/getSolvedCounts.js";
import { mdSolvedCounts } from "./markdown/solvedCounts.js";
import { mdNotes } from "./markdown/notes.js";
import {
  addLemmaXStockCounts,
  getLemmaXStockCount,
} from "./data/getLemmaXStockCounts.js";
import { mdLemmaXStockCounts } from "./markdown/lemmaXStockCounts.js";
import { addRuntimes, getRuntimes } from "./data/getRuntime.js";
import { mdRuntimes } from "./markdown/runtime.js";
import { mdLemmaXStockTimes } from "./markdown/lemmaXStockTimes.js";
import {
  getAllLemmaXStockTimes,
  getLemmaXStockTimes,
} from "./data/getLemmaXStockTimes.js";

const flags = {
  // Generate formulas with lemmas
  genset: true,
  // Run benchmarks
  benchexec: true,
  // Generate results
  results: true,
};

import { config } from "../benchmarks/example/config.js";

const configs = [config];

for (const config of configs) {
  for (const arithConfig of config.arithConfigs) {
    const formulaDir = createFolder(
      `${config.directory}/formulas/${arithConfig}`,
      flags.genset
    );
    const benchexecDir = createFolder(
      `${config.directory}/benchexec/${arithConfig}`,
      flags.benchexec
    );
    const resultDir = createFolder(
      `${config.directory}/results/${arithConfig}`,
      flags.results
    );

    if (flags.genset) {
      for (const solver of ["z3", "cvc5"] as const) {
        if (!config.benchmarkTypes.some((type) => type.endsWith(solver)))
          continue;

        copySourceFormulas(
          `${config.sourceDirectory}/${arithConfig}`,
          `${formulaDir}/stock-${solver}`
        );

        genset({
          cfg: `${solver}-${arithConfig}`,
          benchexecConfig: config.benchexec,
          benchmarkConfig: config.benchmarkConfigs[arithConfig],
          dir: `${formulaDir}/stock-${solver}`,
        });
        await createLemmaFiles({
          solver,
          dir: `${formulaDir}`,
          timeout: config.lemmas.genTime,
          lemmaOps: config.lemmas.ops,
        });
        genset({
          cfg: `cvc5-${arithConfig}`,
          benchexecConfig: config.benchexec,
          benchmarkConfig: config.benchmarkConfigs[arithConfig],
          dir: `${formulaDir}/${solver}-lemmas-cvc5`,
        });
        genset({
          cfg: `z3-${arithConfig}`,
          benchexecConfig: config.benchexec,
          benchmarkConfig: config.benchmarkConfigs[arithConfig],
          dir: `${formulaDir}/${solver}-lemmas-z3`,
        });
      }
    }

    // --

    if (flags.benchexec) {
      for (const benchmarkType of config.benchmarkTypes) {
        await benchexec({
          xmlFile: `${formulaDir}/${benchmarkType}/config.xml`,
          threads: config.benchexec.threads,
          resDir: `${benchexecDir}/${benchmarkType}/`,
        });
      }
    }

    // --

    if (flags.results) {
      await unzipall(benchexecDir);
      const data = await readxmls(benchexecDir);
      if (!data) throw new Error("no data");

      const benchmarks: Benchmarks = new Map();
      data.forEach((d) => {
        d?.benchmarks?.forEach((b) => {
          const configMap =
            benchmarks.get(b.name) ??
            benchmarks.set(b.name, new Map()).get(b.name)!;
          const benchmarkTypeMap =
            configMap.get(d.name) ??
            configMap.set(d.name, new Map()).get(d.name)!;

          const status = parseStatus(b.status);

          // Add time for lemma generation
          let cputime = b.cputime;
          if (!stockBenchmarkTypes.includes(d.type as StockBenchmarkType)) {
            cputime += config.lemmas.genTime / 1000;
          }

          benchmarkTypeMap.set(d.type, {
            cputime: cputime,
            status: status,
          });
        });
      });

      const allConfigs = new Set<string>();
      benchmarks.forEach((map) =>
        Array.from(map.keys()).map((config) => allConfigs.add(config))
      );

      let allRuntimes = {};
      let allStatusCnts = getStatusCounts(new Map());
      let allBetterCnts = {};
      let allSolvedCnts = {};
      let allLemmaXStockCnts = getLemmaXStockCount(new Map());

      for (const curConfig of allConfigs) {
        const relevantBenchmarks: RelevantBenchmarks = new Map();

        benchmarks.forEach((configMap, name) => {
          const types = configMap.get(curConfig);
          if (!types) return;

          relevantBenchmarks.set(name, types);
        });

        await getScatterPlotPerms({
          benchmarks: relevantBenchmarks,
          resultDir: `${resultDir}/${curConfig}`,
        });

        await getLemmaXStockScatterPlot({
          benchmarks: relevantBenchmarks,
          resultDir: `${resultDir}/${curConfig}`,
        });

        writeFileSync(`${resultDir}/${curConfig}.md`, "");

        let markdown = `# ${curConfig}`;

        markdown += mdPlots(resultDir, curConfig);

        const runtimes = getRuntimes(relevantBenchmarks);
        allRuntimes = addRuntimes(allRuntimes, runtimes);

        const statusCnts = getStatusCounts(relevantBenchmarks);
        allStatusCnts = addStatusCounts(allStatusCnts, statusCnts);

        const betterCnts = getBetterCountPerms(
          relevantBenchmarks,
          config.benchmarkTypes
        );
        allBetterCnts = addBetterCounts(allBetterCnts, betterCnts);

        const solvedCnts = getSolvedCountsPerms(
          relevantBenchmarks,
          config.benchmarkTypes
        );
        allSolvedCnts = addSolvedCounts(allSolvedCnts, solvedCnts);

        const lemmaXStockCnts = getLemmaXStockCount(relevantBenchmarks);
        allLemmaXStockCnts = addLemmaXStockCounts(
          allLemmaXStockCnts,
          lemmaXStockCnts
        );

        markdown += `
## General Info
- Number of benchmarks: ${benchmarks.size}
- Number of configs: ${allConfigs.size}
- Number of benchmark types: ${config.benchmarkTypes.length}\n`;

        markdown += mdNotes(config.notes || "");
        markdown += mdRuntimes(runtimes);
        markdown += mdStatusCounts(statusCnts);
        markdown += mdBetterCounts(betterCnts);
        markdown += mdLemmaXStockCounts(lemmaXStockCnts);
        markdown += mdSolvedCounts(solvedCnts);
        markdown += mdLemmaXStockTimes(getLemmaXStockTimes(relevantBenchmarks));

        appendFileSync(`${resultDir}/${curConfig}.md`, markdown);
      }

      await getAllLemmaXStockScatterPlot({ benchmarks, resultDir });

      let markdown = `# All\n`;
      markdown += mdStatusCounts(allStatusCnts);
      markdown += mdNotes(config.notes || "");
      markdown += mdPlots(resultDir, "");
      markdown += mdRuntimes(allRuntimes);
      markdown += mdBetterCounts(allBetterCnts);
      markdown += mdLemmaXStockCounts(allLemmaXStockCnts);
      markdown += mdSolvedCounts(allSolvedCnts);
      markdown += mdLemmaXStockTimes(getAllLemmaXStockTimes(benchmarks));
      writeFileSync(`${resultDir}/all.md`, markdown);
    }
  }
}

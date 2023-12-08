import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "fs";
import { runZ3 } from "../solvers/z3/run.js";
import { runCVC5 } from "../solvers/cvc5/run.js";
import { processLemmas } from "../lemmas/processing/process.js";
import { addLemmas } from "../lemmas/parsing/parsing.js";
import { createFolder } from "./create-folder.js";

interface CreateLemmaFiles {
  solver: "cvc5" | "z3";
  dir: string;
  timeout: number;
  lemmaOps: { fn: (lemmas: string[], opts: any) => string[]; opts: any }[];
}

export async function createLemmaFiles({
  solver,
  dir,
  timeout,
  lemmaOps,
}: CreateLemmaFiles) {
  const baseDir = realpathSync(dir);
  const baseDirContents = readdirSync(baseDir);
  if (!baseDirContents.includes(`stock-${solver}`)) {
    throw new Error(`Missing folder: ${`stock-${solver}`}`);
  }

  console.log(`Generating lemmas with ${solver}...`);

  if (solver === "z3") {
    const config = "def";

    // Set up folders
    createFolder(`${baseDir}/z3-lemmas-z3`, true);
    createFolder(`${baseDir}/z3-lemmas-cvc5`, true);

    // Read the stock set file, which contains all the paths to the formulas
    const set = readFileSync(`${baseDir}/stock-z3/set.set`, "utf8").split("\n");

    for (let i = 0; i < set.length; i++) {
      const formulaPath = set[i];
      const formulaName = formulaPath.split("/").pop();
      const formula = readFileSync(formulaPath, "utf8");

      console.log(`${i + 1}/${set.length} : ${formulaName}`);

      const res = await runZ3({
        benchmark: formula,
        config,
        timeout,
        lemmas: true,
      });

      console.log(
        `${i + 1}/${set.length} : generated ${res.lemmas.length} lemmas`
      );

      if (res.lemmas.length === 0) {
        console.log("");
        continue;
      }

      const lemmas = processLemmas(res.lemmas, lemmaOps);
      const formulaWithLemmas = addLemmas(formula, lemmas);

      console.log(
        `${i + 1}/${set.length} : finished with ${lemmas.length} lemmas\n`
      );

      for (const dir of ["z3-lemmas-cvc5", "z3-lemmas-z3"]) {
        writeFileSync(`${baseDir}/${dir}/${formulaName}`, formulaWithLemmas);
        appendFileSync(
          `${baseDir}/${dir}/set.set`,
          `${baseDir}/${dir}/${formulaName}` + "\n"
        );
        appendFileSync(
          `${baseDir}/${dir}/set.log`,
          `${formulaName} ; time: ${res.time} ; lemma count: ${lemmas.length} ; res: ${res.result}` +
            "\n"
        );
      }
    }
  }

  // cvc5
  if (solver === "cvc5") {
    // Set up folders
    createFolder(`${baseDir}/cvc5-lemmas-z3`, true);
    createFolder(`${baseDir}/cvc5-lemmas-cvc5`, true);

    // Read the stock set file, which contains all the paths to the formulas
    const set = readFileSync(`${baseDir}/stock-cvc5/set.set`, "utf8").split(
      "\n"
    );

    for (let i = 0; i < set.length; i++) {
      const formulaPath = set[i];
      const formulaName = formulaPath.split("/").pop();
      const formula = readFileSync(formulaPath, "utf8");

      console.log(`${i + 1}/${set.length} : ${formulaName}`);

      const res = await runCVC5({
        benchmark: formula,
        timeout,
        lemmas: true,
      });

      console.log(
        `${i + 1}/${set.length} : generated ${res.lemmas.length} lemmas`
      );

      if (res.lemmas.length === 0) {
        console.log("");
        continue;
      }

      let lemmas = processLemmas(res.lemmas, lemmaOps);

      // CVC5-specific processing
      lemmas = lemmas.map((line) => {
        line = line.replaceAll("learned-lit", "assert");
        return line.replaceAll(new RegExp(/:(.*)\)/g), ")");
      });

      const formulaWithLemmas = addLemmas(formula, lemmas);

      console.log(
        `${i + 1}/${set.length} : finished with ${lemmas.length} lemmas\n`
      );

      for (const dir of ["cvc5-lemmas-cvc5", "cvc5-lemmas-z3"]) {
        writeFileSync(`${baseDir}/${dir}/${formulaName}`, formulaWithLemmas);
        appendFileSync(
          `${baseDir}/${dir}/set.set`,
          `${baseDir}/${dir}/${formulaName}` + "\n"
        );
        appendFileSync(
          `${baseDir}/${dir}/set.log`,
          `${formulaName} ; time: ${res.time} ; lemma count: ${lemmas.length} ; res: ${res.result}` +
            "\n"
        );
      }
    }
  }
}

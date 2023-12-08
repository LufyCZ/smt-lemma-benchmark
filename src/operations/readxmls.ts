import convert from "xml-js";
import { readFileSync, readdirSync, statSync } from "fs";
import { BenchmarkType } from "../types";

interface Attributes {
  benchmarkname: string;
  date: string;
  starttime: string;
  tool: string;
  version: string;
  toolmodule: string;
  generator: string;
  memlimit: string;
  timelimit: string;
  cpuCores: string;
  options: string;
  block: string;
  name: string;
  endtime: string;
}

export async function readxmls(dir: string) {
  return Promise.all(
    readdirSync(dir).flatMap((folder) => {
      if (!statSync(`${dir}/${folder}`).isDirectory()) return;
      return readdirSync(`${dir}/${folder}`).flatMap((file) => {
        if (file.endsWith(".xml")) {
          const fileContents = readFileSync(`${dir}/${folder}/${file}`, "utf8");

          const str = convert.xml2json(fileContents);
          const obj = JSON.parse(str);

          return {
            ...(obj.elements[1].attributes as Attributes),
            type: folder as BenchmarkType,
            benchmarks: (obj.elements[1].elements as [])
              .filter((e: { name: string }) => e.name === "run")
              .map((e: any) => {
                const elements = e.elements;

                return {
                  name: String(e.attributes.name).split("/").pop()!,
                  cputime: Number(
                    elements[0].attributes.value.replace("s", "")
                  ),
                  status: String(elements[2].attributes.value),
                };
              }),
          };
        }
      });
    })
  ).then((r) => r.filter(Boolean));
}

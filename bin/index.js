#!/usr/bin/env node

import { join } from "path"
import { fileURLToPath } from 'url';
const dir = join(fileURLToPath(import.meta.url), '..');
import { readFileSync } from "fs";
const p = JSON.parse(readFileSync(join(dir, "../package.json"), "utf8"));
import { main } from "../dist/index.js";
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const app = Object.keys(p.bin)[0]

// https://www.npmjs.com/package/yargs
const argv = yargs(hideBin(process.argv))
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .option("dry-run", {
    type: "boolean",
    description: "Dry run",
  })
  .option("build", {
    alias: "b",
    type: "boolean",
    description: "Build the files from angular.json",
  })
  .option("debug", {
    type: "boolean",
    description: "Debug mode",
  })
  .usage(`Usage: ${app}`)
  .epilog("https://art-ws.org, Copyright 2021")
  .example(app, p.description || "").parse();

main({ argv, app }).catch((e) => {
  console.error(e)
  process.exit(1)
})

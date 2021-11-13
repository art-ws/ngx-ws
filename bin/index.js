#!/usr/bin/env node
const path = require("path")
const package = require(path.join(__dirname, "../package.json"))
const { main } = require("../dist/index")

const app = Object.keys(package.bin)[0]

// https://www.npmjs.com/package/yargs
const { argv } = require("yargs")
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .option("dry-run", {
    type: "boolean",
    description: "Dry run",
  })
  .option("debug", {
    type: "boolean",
    description: "Debug mode",
  })
  .usage(`Usage: ${app}`)
  .epilog("https://art-ws.org, Copyright 2021")
  .example(app, package.description || "")

main({ argv, app }).catch((e) => {
  console.error(e)
  process.exit(1)
})

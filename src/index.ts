#!/usr/bin/env node

import cac from "cac"
import { init, update } from "./scripts"
import { newProject } from "./actions"

import { version } from "../package.json"

const cli = cac('wid');

cli
  .command('[..files]', 'default command: init、update')
  .action((name) => {
    switch(name) {
      case "init": init(); break;
      case "update": update(); break;
      default: return null;
    }
  })

cli
  .command('new [name]', 'create project based on a specified boilerplate')
  .option('--path [path]', 'path corresponding to the project boilerplate')
  .example('--path monorepo/turbo')
  .action(newProject)

cli.help().version(version).parse()


#!/usr/bin/env node

import cac from "cac"
import { newProject } from "./actions"
import { init, update, set } from "./scripts"

import { version } from "../package.json"

const cli = cac('wid');

cli
  .command('[..files]', 'default command: init、update')
  .option('--repo [repo url]', 'set a custom repository url')
  .action((name, options) => {
    switch(name) {
      case "init": init(); break;
      case "set": set(options); break;
      case "reset": set({'--': [], reset: true}); break;
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


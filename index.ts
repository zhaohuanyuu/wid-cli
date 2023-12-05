#!/usr/bin/env node

import cac from "cac"
import { intro, outro } from '@clack/prompts'

import { version } from "./package.json"

const cli = cac('wid');

cli.help();
cli.version(version);

cli
  .command('create <project>', 'create a new project')
  .option('--name <name>', 'project name')
  .action((name, options) => {
    intro('create project:'+name)
    outro('create project:'+name)
  })

cli.parse()

import { join } from "node:path"
import { readFile } from "node:fs/promises"
import color from "picocolors"
import {
  log,
  text,
  intro,
  outro,
  group,
  select,
  cancel,
  spinner
} from "@clack/prompts"

import { copy, getFileStat } from "../helpers/fs"
import { validateNpmName } from "../helpers/validate"
import { BOILERPLATES_DIR, BOILERPLATES_JSON } from "../helpers/constants"

type BoilerplateItem = {
  name: string
  children: { name: string }[]
}

export default async (name: string, option: any) => {
  intro(color.bgCyan(' wid new project '))

  if (!name) {
    name = await text({
      message: "what is the name of your project?",
      placeholder: "your project name",
      validate(value) {
        if (value.length <= 0) return 'project name is required!'
      }
    }) as string
    console.log(color.magenta(name))
  }

  try {
    const { valid, problems } = validateNpmName(name);
    if (!valid) {
      problems?.forEach(item => log.error(color.red(item)))
      outro('new project failed!')
      return;
    }
  
    const boilerplateStr = await readFile(BOILERPLATES_JSON, 'utf-8');
    const boilerplates = boilerplateStr ? JSON.parse(boilerplateStr) : {};
    const project = await group(
      {
        category: () => select<any, string>({
          message: "select a project category",
          options: boilerplates.map((item: BoilerplateItem) => ({ value: item.name, label: item.name }))
        }),
        template: ({ results }) => {
          const category = results.category;
          const list = boilerplates.find((item: BoilerplateItem) => item.name === category).children;
          if (!list.length) {
            return cancel(`cannot find the boilerplate under ${color.bold(category)}/`);
          }
          return select<any, string>({
            message: "select a project template",
            options: list.map((item: Pick<BoilerplateItem, 'name'>) => ({ value: item.name, label: item.name }))
          })
        }
      },
      {
        onCancel: ({results}) => {
          const processKeys = Object.keys(results).join(', ');
          outro(`${processKeys} operation cancelled!`)
          process.exit(0);
        }
      }
    )
  
    const s = spinner();
    const copySource = ['**'];
    const { category, template } = project;
    const destDir = join(process.cwd(), `../${name}`);
    const projectStat = await getFileStat(destDir);
    
    s.start('project boilerplate generating...');
    if (projectStat?.isDirectory()) {
      log.error(`folder ${name} had already been existed!`)
      s.stop(`new project ${name} failed`);
      return;
    }
    await copy(copySource, destDir, {
      parents: true,
      cwd: `${BOILERPLATES_DIR}/${category}/${template}`
    })
    s.stop('project boilerplate generate completed');
  
    outro(`new project ${name} complete`)
  } catch (err) {
    outro(err?.toString());
  }
}
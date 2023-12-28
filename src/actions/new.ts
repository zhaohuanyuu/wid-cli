import { join } from "node:path"
import color from "picocolors"
import {
  log,
  text,
  note,
  intro,
  outro,
  group,
  select,
  cancel,
  spinner
} from "@clack/prompts"

import { validateNpmName } from "../helpers/validate"
import { copy, isExist, readJson, updateJson } from "../helpers/fs"
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
  
    const boilerplates = await readJson(BOILERPLATES_JSON);
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
    const destDir = join(process.cwd(), `/${name}`);
    const projectExist = await isExist(destDir);
    
    s.start('project boilerplate generating...');
    if (projectExist) {
      log.error(`folder ${name} had already been existed!`)
      s.stop(`new project ${name} failed`);
      return;
    }
    await copy(copySource, destDir, {
      parents: true,
      cwd: `${BOILERPLATES_DIR}/${category}/${template}`
    })
    await updateJson(`${destDir}/package.json`, res => ({ ...res, name }));
    s.stop('project boilerplate generate completed');

    const nextSteps = `cd   ${name}\npnpm install\npnpm dev`;

	  note(nextSteps, 'then you can'); 
    outro(`new project ${name} complete`)
  } catch (err) {
    outro(err?.toString());
  }
}
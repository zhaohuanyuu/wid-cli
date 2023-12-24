import { writeFile } from "node:fs/promises"
import color from "picocolors"
import { simpleGit } from "simple-git"
import { intro, outro, spinner, log } from "@clack/prompts"

import { getDirsFromPath, getFileStat } from "../helpers/fs"
import { BOILERPLATES_DIR, BOILERPLATES_JSON } from "../helpers/constants"

export default async () => {
  const s = spinner();
  const git = simpleGit();
  const repoUrl = 'https://github.com/zhaohuanyuu/wid-templates.git';

  intro(color.bgCyan(' wid initialization '))

  try {
    const repoStat = await getFileStat(BOILERPLATES_DIR);
    
    // check project boilerplates is exist
    if (repoStat?.isDirectory()) {
      log.info(`project boilerplates already downloaded`);
      log.success(`you can access at: ${color.underline(BOILERPLATES_DIR)}`);
      outro(`wid has been initialized`);
      return;
    }

    // download project boilerplates
    s.start('project boilerplates downloading...');
    await git.clone(repoUrl, BOILERPLATES_DIR, ['--depth=1']);
    s.stop(`project boilerplates already downloaded`);
    log.success(`you can access at: ${color.underline(BOILERPLATES_DIR)}`);

    // generate boilerplates structure json file
    const dirs = await getDirsFromPath(BOILERPLATES_DIR);
    const result = await Promise.all(dirs.map(async (dir) => {
      const name = dir.name;
      const subDirs = await getDirsFromPath(dir.path + '/' + name);
      return {
        name: name,
        children: subDirs.map(subDir => ({ name: subDir.name }))
      };
    }));
    await writeFile(BOILERPLATES_JSON, JSON.stringify(result, null, 2));

    outro(`wid has been initialized`);
  } catch(err) {
    outro(err?.toString());
  }
}
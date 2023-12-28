import { writeFile } from "node:fs/promises"
import color from "picocolors"
import { simpleGit } from "simple-git"
import { intro, outro, spinner, log } from "@clack/prompts"

import config from "../helpers/config"
import { getDirsFromPath, isExist } from "../helpers/fs"
import { BOILERPLATES_DIR, BOILERPLATES_JSON, BOILERPLATES_REPO } from "../helpers/constants"

export default async (isSet?: boolean) => {
  const s = spinner();
  const git = simpleGit();
  const tipPrefix = isSet ? 're' : '';
  const {
    repoUrl = BOILERPLATES_REPO,
    boilerplateDir = BOILERPLATES_DIR
  } = await config();

  intro(color.bgCyan(` wid ${tipPrefix}initializing `));

  // log.warning(color.bgMagenta(' debug > repoUrl: ') + repoUrl)

  try {
    const repoExist = await isExist(boilerplateDir);
    
    // check project boilerplates is exist
    if (repoExist) {
      log.info(`project boilerplates already downloaded`);
      log.success(`you can access at: ${color.underline(boilerplateDir)}`);
      outro(`wid has been ${tipPrefix}initialized`);
      return;
    }

    // download project boilerplates
    s.start('project boilerplates downloading...');
    await git.clone(repoUrl, boilerplateDir, ['--depth=1']);
    s.stop(`project boilerplates already downloaded`);
    log.success(`you can access at: ${color.underline(boilerplateDir)}`);

    // generate boilerplates structure json file
    const dirs = await getDirsFromPath(boilerplateDir);
    const result = await Promise.all(dirs.map(async (dir) => {
      const name = dir.name;
      const subDirs = await getDirsFromPath(dir.path + '/' + name);
      return {
        name: name,
        children: subDirs.map(subDir => ({ name: subDir.name }))
      };
    }));
    await writeFile(BOILERPLATES_JSON, JSON.stringify(result, null, 2));

    outro(`wid has been ${tipPrefix}initialized`);
  } catch(err) {
    outro(err?.toString());
  }
}
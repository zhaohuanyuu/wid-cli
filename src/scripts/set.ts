import { log } from "@clack/prompts"

import { init } from "./index"
import { WID_DIR } from "../helpers/constants"
import { writeJson, updateJson } from "../helpers/fs"

type Options = {
  '--': any[],
  [k: string]: any
}

export default async (options: Options) => {
  const { repo, reset } = options;
  const config = `${WID_DIR}/config.json`;

  // set project boilerplate repository url
  if (repo) {
    const isHttps = /^https:\/\/github\.com\/([a-zA-Z\d_-]+)\/([a-zA-Z\d_-]+)(\.git)?$/;
    const isSsh = /^git@github\.com:([a-zA-Z\d_-]+)\/([a-zA-Z\d_-]+)(\.git)?$/;
    const isValid = isHttps.test(repo) || isSsh.test(repo);

    if (!isValid) {
      log.error('It\'s not a valid github repository url!')
      return;
    }

    const repoNameRegex = /\/([^/]+)\.git$/;
    const [, repoName = ''] = repo.match(repoNameRegex);

    await writeJson(config, {
      repoUrl: repo,
      boilerplateDir: `${WID_DIR}/${repoName}`
    })

    // run init again
    await init(true);
  }

  // reset configuration
  if (reset) {
    await updateJson(config, res => ({}));
    await init(true);
  }
}
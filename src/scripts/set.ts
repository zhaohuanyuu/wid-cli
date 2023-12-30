import { log } from "@clack/prompts"

import { init } from "./index"
import { updateJson } from "../helpers/fs"
import { WID_DIR, WID_CONF } from "../helpers/constants"

type Options = {
  '--': any[],
  [k: string]: any
}

export default async (options: Options) => {
  const { repo, reset } = options;

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

    await updateJson(WID_CONF, res => ({
      ...res,
      repoUrl: repo,
      boilerplateDir: `${WID_DIR}/${repoName}`
    }))

    // run init again
    await init(true);
  }

  // reset configuration
  if (reset) {
    await updateJson(WID_CONF, res => ({
      ...res,
      repoUrl: undefined,
      boilerplateDir: undefined
    }));
    await init(true);
  }
}
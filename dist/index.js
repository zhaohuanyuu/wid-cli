#!/usr/bin/env node

// src/index.ts
import cac from "cac";

// src/actions/new.ts
import { join } from "node:path";
import color from "picocolors";
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
} from "@clack/prompts";

// src/helpers/fs.ts
import path from "node:path";
import {
  stat,
  readdir,
  mkdir,
  copyFile,
  readFile,
  writeFile
} from "fs/promises";
import glob from "fast-glob";
var isExist = async (path2) => {
  const stats = await stat(path2).catch((err) => null);
  return stats?.isFile() || stats?.isDirectory();
};
var getDirsFromPath = async (path2) => {
  const files = await readdir(path2, { withFileTypes: true });
  return files.filter((item) => {
    return !item.name.startsWith(".") && item.isDirectory();
  });
};
var identity = (x) => x;
var copy = async (src, dest, { cwd, rename = identity, parents = true } = {}) => {
  const source = typeof src === "string" ? [src] : src;
  if (source.length === 0 || !dest) {
    throw new TypeError("`src` and `dest` are required");
  }
  const sourceFiles = await glob(source, {
    cwd,
    dot: true,
    absolute: false,
    stats: false
  });
  const destRelativeToCwd = cwd ? path.resolve(cwd, dest) : dest;
  return Promise.all(
    sourceFiles.map(async (p) => {
      const dirname = path.dirname(p);
      const basename = rename(path.basename(p));
      const from = cwd ? path.resolve(cwd, p) : p;
      const to = parents ? path.join(destRelativeToCwd, dirname, basename) : path.join(destRelativeToCwd, basename);
      await mkdir(path.dirname(to), { recursive: true });
      return copyFile(from, to);
    })
  );
};
var readJson = async (path2) => {
  const exist = await isExist(path2);
  if (!exist) {
    throw new Error(`Cannot find ${path2}`);
  }
  try {
    const jsonStr = await readFile(path2, "utf-8");
    return JSON.parse(jsonStr);
  } catch (err) {
    throw new Error(`Cannot read ${path2}: ${err?.message}`);
  }
};
var writeJson = async (path2, value) => {
  try {
    await writeFile(path2, JSON.stringify(value, null, 2));
  } catch (err) {
    throw new Error(`Cannot write ${path2}: ${err?.message}`);
  }
};
var updateJson = async (path2, updater) => {
  const updateValue = updater(await readJson(path2));
  await writeJson(path2, updateValue);
};

// src/helpers/constants.ts
import { homedir } from "node:os";
var WID_DIR = `${homedir()}/.wid`;
var BOILERPLATES_DIR = `${WID_DIR}/boilerplates`;
var BOILERPLATES_JSON = `${WID_DIR}/boilerplates.json`;
var BOILERPLATES_REPO = "https://github.com/zhaohuanyuu/wid-templates.git";

// src/helpers/config.ts
var config_default = async () => {
  try {
    return await readJson(`${WID_DIR}/config.json`);
  } catch (err) {
    return {};
  }
};

// src/helpers/validate.ts
import validateProjectName from "validate-npm-package-name";
function validateNpmName(name) {
  const nameValidation = validateProjectName(name);
  if (nameValidation.validForNewPackages) {
    return { valid: true };
  }
  return {
    valid: false,
    problems: [
      ...nameValidation.errors || [],
      ...nameValidation.warnings || []
    ]
  };
}

// src/actions/new.ts
var new_default = async (name, option) => {
  intro(color.bgCyan(" wid new project "));
  if (!name) {
    name = await text({
      message: "what is the name of your project?",
      placeholder: "your project name",
      validate(value) {
        if (value.length <= 0)
          return "project name is required!";
      }
    });
    console.log(color.magenta(name));
  }
  try {
    const { valid, problems } = validateNpmName(name);
    if (!valid) {
      problems?.forEach((item) => log.error(color.red(item)));
      outro("new project failed!");
      return;
    }
    const boilerplates = await readJson(BOILERPLATES_JSON);
    const project = await group(
      {
        category: () => select({
          message: "select a project category",
          options: boilerplates.map((item) => ({ value: item.name, label: item.name }))
        }),
        template: ({ results }) => {
          const category2 = results.category;
          const list = boilerplates.find((item) => item.name === category2).children;
          if (!list.length) {
            return cancel(`cannot find the boilerplate under ${color.bold(category2)}/`);
          }
          return select({
            message: "select a project template",
            options: list.map((item) => ({ value: item.name, label: item.name }))
          });
        }
      },
      {
        onCancel: ({ results }) => {
          const processKeys = Object.keys(results).join(", ");
          outro(`${processKeys} operation cancelled!`);
          process.exit(0);
        }
      }
    );
    const s = spinner();
    const copySource = ["**"];
    const { category, template } = project;
    const destDir = join(process.cwd(), `/${name}`);
    const projectExist = await isExist(destDir);
    const { boilerplateDir = BOILERPLATES_DIR } = await config_default();
    s.start("project boilerplate generating...");
    if (projectExist) {
      log.error(`folder ${name} had already been existed!`);
      s.stop(`new project ${name} failed`);
      return;
    }
    await copy(copySource, destDir, {
      parents: true,
      cwd: `${boilerplateDir}/${category}/${template}`
    });
    await updateJson(`${destDir}/package.json`, (res) => ({
      ...res,
      name
    }));
    s.stop("project boilerplate generate completed");
    const nextSteps = `cd   ${name}
pnpm install
pnpm dev`;
    note(nextSteps, "then you can");
    outro(`new project ${name} complete`);
  } catch (err) {
    outro(err?.toString());
  }
};

// src/scripts/init.ts
import { writeFile as writeFile2 } from "node:fs/promises";
import color2 from "picocolors";
import { simpleGit } from "simple-git";
import { intro as intro2, outro as outro2, spinner as spinner2, log as log2 } from "@clack/prompts";
var init_default = async (isSet) => {
  const s = spinner2();
  const git = simpleGit();
  const tipPrefix = isSet ? "re" : "";
  const {
    repoUrl = BOILERPLATES_REPO,
    boilerplateDir = BOILERPLATES_DIR
  } = await config_default();
  intro2(color2.bgCyan(` wid ${tipPrefix}initializing `));
  try {
    const repoExist = await isExist(boilerplateDir);
    if (repoExist) {
      log2.info(`project boilerplates already downloaded`);
      log2.success(`you can access at: ${color2.underline(boilerplateDir)}`);
      outro2(`wid has been ${tipPrefix}initialized`);
      return;
    }
    s.start("project boilerplates downloading...");
    await git.clone(repoUrl, boilerplateDir, ["--depth=1"]);
    s.stop(`project boilerplates already downloaded`);
    log2.success(`you can access at: ${color2.underline(boilerplateDir)}`);
    const dirs = await getDirsFromPath(boilerplateDir);
    const result = await Promise.all(dirs.map(async (dir) => {
      const name = dir.name;
      const subDirs = await getDirsFromPath(dir.path + "/" + name);
      return {
        name,
        children: subDirs.map((subDir) => ({ name: subDir.name }))
      };
    }));
    await writeFile2(BOILERPLATES_JSON, JSON.stringify(result, null, 2));
    outro2(`wid has been ${tipPrefix}initialized`);
  } catch (err) {
    outro2(err?.toString());
  }
};

// src/scripts/set.ts
import { log as log3 } from "@clack/prompts";
var set_default = async (options) => {
  const { repo, reset } = options;
  const config = `${WID_DIR}/config.json`;
  if (repo) {
    const isHttps = /^https:\/\/github\.com\/([a-zA-Z\d_-]+)\/([a-zA-Z\d_-]+)(\.git)?$/;
    const isSsh = /^git@github\.com:([a-zA-Z\d_-]+)\/([a-zA-Z\d_-]+)(\.git)?$/;
    const isValid = isHttps.test(repo) || isSsh.test(repo);
    if (!isValid) {
      log3.error("It's not a valid github repository url!");
      return;
    }
    const repoNameRegex = /\/([^/]+)\.git$/;
    const [, repoName = ""] = repo.match(repoNameRegex);
    await writeJson(config, {
      repoUrl: repo,
      boilerplateDir: `${WID_DIR}/${repoName}`
    });
    await init_default(true);
  }
  if (reset) {
    await updateJson(config, (res) => ({}));
    await init_default(true);
  }
};

// src/scripts/update.ts
import color3 from "picocolors";
import { simpleGit as simpleGit2 } from "simple-git";
import { intro as intro3, outro as outro3, spinner as spinner3 } from "@clack/prompts";
var update_default = async () => {
  const git = simpleGit2(BOILERPLATES_DIR);
  intro3(color3.bgCyan("wid update"));
  try {
    const loading = spinner3();
    loading.start("update project boilerplates...");
    await git.pull();
    loading.stop("wid has been updated");
  } catch (err) {
    outro3(err?.toString());
  }
};

// package.json
var version = "0.1.7";

// src/index.ts
var cli = cac("wid");
cli.command("[..files]", "default command: init\u3001update").option("--repo [repo url]", "set a custom repository url").action((name, options) => {
  switch (name) {
    case "init":
      init_default();
      break;
    case "set":
      set_default(options);
      break;
    case "reset":
      set_default({ "--": [], reset: true });
      break;
    case "update":
      update_default();
      break;
    default:
      return null;
  }
});
cli.command("new [name]", "create project based on a specified boilerplate").option("--path [path]", "path corresponding to the project boilerplate").example("--path monorepo/turbo").action(new_default);
cli.help().version(version).parse();
//# sourceMappingURL=index.js.map
import { homedir } from "node:os"
import { stat } from "node:fs/promises"
import color from "picocolors"
import { simpleGit } from "simple-git"
import { intro, outro, spinner } from "@clack/prompts"

export default async () => {
  const loading = spinner();
  const git = simpleGit();
  const repoUrl = 'https://github.com/zhaohuanyuu/wid-templates.git';
  const destinationPath = `${homedir()}/.wid/boilerplates`;

  intro(color.bgCyan(' wid initializing... '))
  
  try {
    const repoStat = await stat(destinationPath).catch(err => null);

    loading.start('project boilerplates downloading...');

    if (repoStat?.isDirectory()) {
      loading.stop(`project boilerplates already downloaded.at: ${color.underline(destinationPath)}`);
      outro(`wid has been initialized`);
      return;
    }

    git.clone(repoUrl, destinationPath, ['--depth=1'], (err) => {
      if (err) {
        return console.error(err);
      }
      loading.stop(`project boilerplates already downloaded. at: ${color.underline(destinationPath)}`);
      outro(`wid has been initialized`);
    })
  } catch(err) {
    outro(err?.toString());
  }
}
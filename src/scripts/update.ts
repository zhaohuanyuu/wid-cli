import { homedir } from "os"
import color from "picocolors"
import { simpleGit } from "simple-git"
import { intro, outro, spinner } from "@clack/prompts"

export default async () => {
  const git = simpleGit(`${homedir()}/.wid/boilerplates`);

  intro(color.bgCyan('wid update'));

  try {
    const loading = spinner();
    loading.start("update project boilerplates...");
    await git.pull();
    loading.stop("wid has been updated");
  } catch (err) {
    outro(err?.toString())
  }
}
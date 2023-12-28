import { homedir } from "os"
import color from "picocolors"
import { simpleGit } from "simple-git"
import { intro, outro, spinner } from "@clack/prompts"
import { BOILERPLATES_DIR } from "../helpers/constants"

export default async () => {
  const git = simpleGit(BOILERPLATES_DIR);

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
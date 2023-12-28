import { log } from "@clack/prompts"

import { readJson } from "./fs"
import { WID_DIR } from "./constants"

export default async () => {
  try {
    return await readJson(`${WID_DIR}/config.json`);
  } catch (err) {
    return {};
  }
};
import { log } from "@clack/prompts"

import { readJson } from "./fs"
import { WID_CONF } from "./constants"

export default async () => {
  try {
    return await readJson(WID_CONF);
  } catch (err) {
    return {};
  }
};
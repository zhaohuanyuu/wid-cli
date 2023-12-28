import { homedir } from "node:os"

export const WID_DIR = `${homedir()}/.wid`
export const BOILERPLATES_DIR = `${WID_DIR}/boilerplates`
export const BOILERPLATES_JSON = `${WID_DIR}/boilerplates.json`
export const BOILERPLATES_REPO = 'https://github.com/zhaohuanyuu/wid-templates.git'
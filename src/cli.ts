import { WorkspaceBundler } from "./core"

export async function main({ argv, app }) {
  const cwd = process.cwd()

  await new WorkspaceBundler({ argv, cwd, app }).run()
}

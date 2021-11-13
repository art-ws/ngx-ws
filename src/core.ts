import $RefParser from "@apidevtools/json-schema-ref-parser"
import { readdirSync, statSync } from "fs"
import fs from "fs-extra"
import _ from "lodash"
import path from "path"
import {
  iterpolateJsonData,
  isYamlFile,
  iterpolateFile,
  loadJSONFromString,
  loadYamlFromString,
  yamlExt,
} from "./interpolate"

const getProjectNames = (projectsDirPath: string) => {
  const result = readdirSync(projectsDirPath).filter((f: string) =>
    statSync(path.join(projectsDirPath, f)).isDirectory()
  )
  result.sort()
  return result
}

const loadJSONFromFile = (fileName: string) =>
  fs.existsSync(fileName)
    ? loadJSONFromString(fs.readFileSync(fileName, "utf8"))
    : null

const loadYamlFromFile = (fileName: string) =>
  fs.existsSync(fileName)
    ? loadYamlFromString(fs.readFileSync(fileName, "utf8"))
    : null

const loadFromFile = (fileName: string) =>
  isYamlFile(fileName) ? loadYamlFromFile(fileName) : loadJSONFromFile(fileName)

const WS_CONFIG = ["angular-workspace", "ng-ws"]
const PROJECT_CONFIG = ["ng-project", "angular-project"]

const jsonExt = ["json", "json5"]

export const lookupFileName = (cwd: string, fileNames: string[]): string => {
  const fileName = fileNames
    .map((fileName) => [
      fileName,
      ...[...jsonExt, ...yamlExt].map((ext) => `${fileName}.${ext}`),
    ])
    .flat()
    .map((fileName) => path.join(cwd, fileName))
    .find((fileName) => fs.existsSync(fileName))

  return fileName
}

async function loadFileAndExpand<T>(args: {
  vars?: object
  isDebug: boolean
  cwd: string
  fileNames: string[]
}): Promise<{ result: T; path: string }> {
  const { cwd, fileNames, isDebug } = args
  let vars = args.vars || {}
  const fileName = lookupFileName(cwd, fileNames)
  const fileNameInterpolated = `${fileName}.expanded${path.extname(fileName)}`
  let json = loadFromFile(fileName)
  vars = _.merge(vars, json.vars || {})
  iterpolateFile(vars, fileName, fileNameInterpolated)
  json = loadFromFile(fileNameInterpolated)

  // https://apitools.dev/json-schema-ref-parser/
  // https://apitools.dev/json-schema-ref-parser/docs/ref-parser.html#dereferenceschema-options-callback
  json = (await $RefParser.dereference(json)) as T

  vars = _.merge(vars, json.vars || {})
  json = iterpolateJsonData(vars, json, fileNameInterpolated)

  if (!isDebug) {
    fs.unlinkSync(fileNameInterpolated)
  }

  return { result: json, path: fileName }
}

interface AngularConfig {
  projects: Record<string, unknown>
}

interface WSConfig {
  vars: object
  resources: unknown
  angular: {
    newProjectRoot: string
  }
  libraries: {
    [packageName: string]: object | string
  }
}

interface ProjectConfig {
  vars: any
  resources: string[]
  project: {
    architect: {
      build: unknown
    }
  }
  libraries: WSConfig["libraries"]
  depends: {
    [dependencyKey: string]: {
      [packageName: string]: string
    }
  }
}

const processProject = async ({ cwd, log, projectsDir, app, options }) => {
  const isDebug = Boolean(options.argv.debug)
  const isDeps = Boolean(options.argv.deps)

  const { result: ngWSJson, path: ngWSPath } =
    await loadFileAndExpand<WSConfig>({
      cwd,
      isDebug,
      fileNames: WS_CONFIG,
    })

  const defaultVars = {
    name: app,
    wsPath: ngWSPath,
    wsName: path.basename(ngWSPath),
    wsDir: path.dirname(ngWSPath),
  }

  const { result: appJson } = await loadFileAndExpand<ProjectConfig>({
    isDebug,
    vars: _.merge(ngWSJson.vars || {}, defaultVars),
    cwd: path.join(cwd, `${projectsDir}/${app}`),
    fileNames: PROJECT_CONFIG,
  })

  if (appJson.vars?.disabled) {
    log(`Skipping '${app}'`)
    return
  }

  const resJson = ngWSJson.resources

  const expandRes = (resources: string[]): string[] => {
    if (!resources?.length) return []
    return resources.reduce((accumulator, resourceName) => {
      const res = resJson[resourceName] ?? {}
      const resDeps = expandRes(res.depends ?? [])
      return [...accumulator, ...resDeps, resourceName]
    }, [])
  }

  const resources = expandRes(appJson.resources ?? [])

  if (resources.length) {
    const tweakOptions = (res: any, build: any, prop: string) => {
      const old = build.options[prop] ?? []
      const src = (res.options ?? {})[prop] ?? []
      if (src.length) {
        const merged = _.union([...src], [...old])
        build.options[prop] = merged
      }
    }

    const mergeResource = (resourceName: string) => {
      const res = resJson[resourceName]
      if (!res) throw new Error(`Resource '${resourceName}' not defined`)
      if (appJson.project?.architect?.build) {
        ;["assets", "styles", "scripts"].forEach((prop) =>
          tweakOptions(res, appJson.project.architect.build, prop)
        )
      }
    }

    resources.reverse().forEach(mergeResource)
    log(`Merged resources for '${app}':`, resources)
  }

  const angularFileName = path.join(cwd, "angular.json")
  let angularJson: AngularConfig = loadFromFile(angularFileName) || {}

  angularJson = _.merge(angularJson, _.omit(ngWSJson.angular, ["projects"]))

  if (appJson.project) {
    angularJson.projects = angularJson.projects || {}
    angularJson.projects[app] = _.merge(
      angularJson.projects[app] || {},
      appJson.project
    )
  }

  const jsonContent = JSON.stringify(angularJson, null, 2)
  if (!options.argv.dryRun) {
    fs.writeFileSync(angularFileName, jsonContent)
    log(`${angularFileName} for '${app}' updated.`)
  } else {
    log(jsonContent)
  }

  if (isDeps && appJson.depends) {
    const requiredBy = app
    const pckgFileName = path.join(cwd, "package.json")
    const pckg = require(pckgFileName)
    Object.keys(appJson.depends).forEach((depKey) => {
      const dep = pckg[depKey]
      const exDep = appJson.depends[depKey]
      Object.keys(exDep).forEach((packageName) => {
        const packageVersion = exDep[packageName]
        if (packageVersion === "@") {
          getPackages({
            ws: ngWSJson,
            proj: appJson,
            libName: packageName,
          }).forEach((itm) => {
            ensureDependency({
              requiredBy,
              depKey,
              dep,
              packageName: itm.p,
              packageVersion: itm.v,
            })
          })
        } else {
          ensureDependency({
            requiredBy,
            depKey,
            dep,
            packageName,
            packageVersion,
          })
        }
      })
      pckg[depKey] = dep
    })
    fs.writeFileSync(pckgFileName, JSON.stringify(pckg, null, 2))
  }
}

function getPackages({
  ws,
  libName,
  proj,
}: {
  ws: WSConfig
  proj: ProjectConfig
  libName: string
}): { p: string; v: string }[] {
  const v = (proj.libraries ?? {})[libName] ?? (ws.libraries ?? {})[libName]
  if (!v)
    throw new Error(
      `Package or package set '${libName}' not defined at #/dependencies`
    )
  if (typeof v === "object") {
    return Object.keys(v).map((key) => {
      return {
        p: key,
        v: v[key],
      }
    })
  } else {
    return [{ p: libName, v: v + "" }]
  }
}

function ensureDependency({
  depKey,
  dep,
  packageName,
  packageVersion,
  requiredBy,
}: {
  depKey: string
  dep: object
  packageName: string
  packageVersion: string
  requiredBy: string
}) {
  if (dep[packageName] === packageVersion) return
  dep[packageName] = packageVersion
  console.log(
    `'${depKey}.${packageName}@${packageVersion}' - updated. (${requiredBy})`
  )
}
class Options {
  argv: { verbose: boolean; dryRun: boolean; debug: boolean }
  cwd: string
  app: string
}

export class WorkspaceBundler {
  private projectsDir: string

  constructor(private readonly options: Options) {}

  private async getProjectsDir(): Promise<string> {
    if (!this.projectsDir) {
      await this.init()
    }
    return this.projectsDir || "projects"
  }

  private log(...args: any[]): void {
    if (this.options?.argv?.verbose) console.log(...args)
  }

  private debug(...args: any[]): void {
    if (this.options?.argv?.debug) console.log("DEBUG:", ...args)
  }

  async init() {
    const { cwd } = this.options
    const { result: ngWSJson } = await loadFileAndExpand<WSConfig>({
      isDebug: false,
      cwd,
      fileNames: WS_CONFIG,
    })
    this.projectsDir = ngWSJson.angular?.newProjectRoot || "projects"
    this.debug(`projectsDir: ${this.projectsDir}`)
  }

  async run() {
    const { cwd } = this.options
    this.debug(`cwd: ${cwd}`)
    const projectsDir = await this.getProjectsDir()
    getProjectNames(`${cwd}/${projectsDir}`).forEach((app) => {
      processProject({
        cwd,
        app,
        projectsDir,
        options: this.options,
        log: this.log.bind(this),
      })
    })
  }
}

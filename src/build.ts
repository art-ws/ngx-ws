import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export type WsFile = {
  localPath: string;
  content: string;
};

export async function buildFiles(o: { workingDir: string }): Promise<WsFile[]> {
  // 1. Load angular.json
  const angularJsonPath = path.join(o.workingDir, "angular.json");
  if (!fs.existsSync(angularJsonPath))
    throw new Error(`angular.json not found in ${o.workingDir}`);
  const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, "utf8"));

  // 2. Prepare workspace YAML (angular-workspace.yaml)
  const wsVars: Record<string, any> = {
    projects: angularJson.newProjectRoot || "projects",
    packageManager: angularJson.cli?.packageManager || "npm",
  };
  const wsYaml: Record<string, any> = {
    vars: wsVars,
    resources: {}, // Not available in angular.json, left empty
    definitions: {}, // Not available in angular.json, left empty
    angular: { ...angularJson, projects: undefined },
  };
  const wsFile: WsFile = {
    localPath: "angular-workspace.yaml",
    content: yaml.dump(wsYaml, { lineWidth: 120 }),
  };

  // 3. Prepare per-project YAMLs
  const projectFiles: WsFile[] = [];
  const projects = angularJson.projects || {};
  for (const [name, project] of Object.entries<any>(projects)) {
    console.log(`Processing project: ${name}`);
    // Guess vars for the project
    const vars: Record<string, any> = {
      name,
      root: project.root || `projects/${name}`,
      src: project.sourceRoot || `projects/${name}/src`,
    };
    if (project.projectType === "application") {
      vars.environments = `${vars.src}/environments`;
      vars.env = `${vars.environments}/environment`;
      vars.styleExt =
        project.architect?.build?.options?.inlineStyleLanguage || "scss";
    }
    // Compose project YAML
    const projYaml: Record<string, any> = {
      vars,
      project,
    };
    const localPath = path.join(wsVars.projects, name, "angular-project.yaml");

    // Process variables in the content
    const jsonContent = processVars({
      varsOrder: ["env", "environments", "styleExt", "root", "src", "name"],
      vars,
      content: JSON.stringify(projYaml, null, 2),
    });

    const content = yaml.dump(JSON.parse(jsonContent), {
      lineWidth: 120,
    });

    projectFiles.push({
      localPath,
      content,
    });
  }

  return [wsFile, ...projectFiles];
}

function processVars(o: {
  varsOrder: string[];
  vars: Record<string, unknown>;
  content: string;
}): string {
  const { varsOrder, vars, content } = o;
  let result = content;
  for (const varName of varsOrder) {
    const value = String(vars[varName]);
    if (value) {
      // Escape special regex characters in value
      const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Find all matches
      const matches = [...result.matchAll(new RegExp(escapedValue, "g"))];
      if (matches.length > 1) {
        // Replace all except the first occurrence
        let replaced = 0;
        result = result.replace(new RegExp(escapedValue, "g"), (match) => {
          replaced++;
          return replaced === 1 ? match : `{{${varName}}}`;
        });
      }
    }
  }
  return result;
}

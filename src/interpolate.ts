import fs from "fs";
import yaml from "js-yaml";
import JSON5 from "json5";
import _ from "lodash";

export const yamlExt = ["yaml", "yml"];

export const isYamlFile = (s: string) =>
  yamlExt.find((ext) => s.includes(`.${ext}`));

export const loadJSONFromString = (data: string) =>
  data ? JSON5.parse(data) : null;

export const loadYamlFromString = (data: string) =>
  data ? yaml.load(data) : null;

const e = {
  RE: /{{(\w|\.)+}}/gi,
  B: "{{",
  E: "}}",
};

export function iterpolateVars(vars: object): void {
  Object.keys(vars).forEach((key) => {
    const value = `${vars[key]}`;
    if (value.includes(e.B)) vars[key] = iterpolate(vars, value);
  });
}
const isEmpty = (v: unknown): boolean =>
  v === undefined || v === null || Number.isNaN(v);

export function iterpolate(vars: object, tpl: string): string {
  const keys = {};
  let match: RegExpExecArray | null;
  while ((match = e.RE.exec(tpl))) {
    let s = match[0];
    s = s.substring(e.B.length, s.length - e.E.length);
    keys[s] = true;
  }

  Object.keys(keys).forEach((key) => {
    const expr = e.B + key + e.E;
    const val = _.get(vars, key);
    const value = isEmpty(val) ? expr : `${val}`;
    tpl = tpl.split(expr).join(value);
  });

  return tpl;
}

export function iterpolateFile(
  vars: object,
  sourcePath: string,
  targetPath: string
): void {
  iterpolateVars(vars);
  let contents = fs.readFileSync(sourcePath, { encoding: "utf8" });
  contents = iterpolate(vars, contents);
  fs.writeFileSync(targetPath, contents);
}

export function iterpolateJsonData<T>(
  vars: object,
  data: T,
  targetPath: string
): T {
  const isYaml = isYamlFile(targetPath);
  let contents = isYamlFile ? yaml.dump(data) : JSON5.stringify(data, null, 2);

  const tmpFile = `${targetPath}.tmp`;
  fs.writeFileSync(tmpFile, contents);
  iterpolateFile(vars, tmpFile, targetPath);
  contents = fs.readFileSync(targetPath, { encoding: "utf8" });
  const result = isYaml
    ? loadYamlFromString(contents)
    : loadJSONFromString(contents);
  fs.unlinkSync(tmpFile);
  return result as T;
}

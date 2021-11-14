# ngx-ws

**Tool to generate [angular.json](https://angular.io/guide/workspace-config) from human readable definitions.**

## Features

- [YAML](https://yaml.org/) and [JSON5](https://json5.org/) support.
- [JSON Reference](https://tools.ietf.org/id/draft-pbryan-zyp-json-ref-03.html) support.
- Recursive values interpolation.
- Simplify [scripts, styles and assets](https://angular.io/guide/workspace-config#styles-and-scripts-configuration) configuration.

## Installation

Install globally:

```sh
mpm install -g ngx-ws
```

Or run with [npx](https://docs.npmjs.com/cli/v7/commands/npx):

```sh
npx ngx-ws
```

## Usage

Run command in directory with `angular.json` file.

```sh
rm angular.json ; ngx-ws -v
```

See [example](https://github.com/saaivs/ng-multi-projects) and pay attention to [angular-workspace.yaml](https://github.com/saaivs/ng-multi-projects/blob/master/my-workspace/angular-workspace.yaml) and [angular-project.yaml](https://github.com/saaivs/ng-multi-projects/blob/master/my-workspace/projects/app1/angular-project.yaml) files.

## Options

```text
--deps               Update package.json with project 
                     specific dependence's. 
--debug              Debug mode (Don't delete temporary files).
--dry-run            Dry run.
-v, --verbose        Verbose output.
--version            Show version number.
--help               Show help.
```

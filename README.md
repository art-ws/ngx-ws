# 🚀 ngx-ws

**Generate [angular.json](https://angular.io/guide/workspace-config) from modular, human-friendly definitions.**

---

## ✨ Features

- 📝 Supports [YAML](https://yaml.org/) and [JSON5](https://json5.org/) formats
- 🔗 Handles [JSON References](https://tools.ietf.org/id/draft-pbryan-zyp-json-ref-03.html) for modular configuration
- 🔄 Recursive variable interpolation for flexible templating
- 🛠️ Simplifies configuration of [scripts, styles, and assets](https://angular.io/guide/workspace-config#styles-and-scripts-configuration)

---

## 📦 Installation

Install globally with npm:

```sh
npm install -g ngx-ws
```

Or use [npx](https://docs.npmjs.com/cli/v7/commands/npx) for one-off runs:

```sh
npx ngx-ws
```

---

## 🚦 Usage

Run `ngx-ws` in a directory containing your `angular.json` file:

```sh
rm angular.json && ngx-ws -v
```

- The tool will generate a new `angular.json` based on your modular workspace and project definitions.

**Example:**  
See the [ngx-ws-example](https://github.com/art-ws/ngx-ws-example) repository.  
Pay special attention to [angular-workspace.yaml](https://github.com/art-ws/ngx-ws-example/blob/master/angular-workspace.yaml) and [angular-project.yaml](https://github.com/art-ws/ngx-ws-example/blob/master/my-workspace/projects/app1/angular-project.yaml).

---

## ⚙️ Options

| Option         | Alias | Description                                                        |
| -------------- | ----- | ------------------------------------------------------------------ |
| `--build`      |       | Build files from `angular.json`                                    |
| `--deps`       |       | Update `package.json` with project-specific dependencies           |
| `--debug`      |       | Enable debug mode (retain temporary files)                         |
| `--dry-run`    |       | Preview changes without writing files                              |
| `--verbose`    |`-v`  | Enable verbose output                                               |
| `--version`    |       |                                                                    |

# 🚀 ngx-ws

**Generate [angular.json](https://angular.io/guide/workspace-config) from modular, human-friendly definitions.**

Easily split a large `angular.json` into modular, project-local files using the power of [JSON References](https://www.npmjs.com/package/@apidevtools/json-schema-ref-parser), with the convenience of [YAML](https://yaml.org/) and [JSON5](https://json5.org/) formats.

---
## 🛠️ How It Works

1. **Install `ngx-ws` globally** (using your preferred package manager):

  ```sh
  npm install -g ngx-ws
  # or
  pnpm add -g ngx-ws
  # or
  yarn global add ngx-ws
  ```

2. **Navigate to your Angular project directory** (where `angular.json` is located):

  ```sh
  cd your-angular-project
  ```

3. **Initialize modular configuration files** from your existing `angular.json`:

  ```sh
  ngx-ws --build
  ```

  This generates `angular-workspace.yaml` and `angular-project.yaml` files.

4. **Edit your configuration** in the new YAML files.  
  You can now manage your workspace and project settings in a modular, human-friendly format.

5. **Regenerate `angular.json`** after making changes:

  ```sh
  ngx-ws -v
  ```

  This will update `angular.json` based on your YAML definitions.

---

**Tip:**  
Once set up, you can focus on editing `angular-workspace.yaml` and `angular-project.yaml`.  
Let `ngx-ws` handle the generation of `angular.json` for you!

## ✨ Features

- 📝 Supports [YAML](https://yaml.org/) and [JSON5](https://json5.org/) formats
- 🔗 Handles [JSON References](https://datatracker.ietf.org/doc/html/draft-pbryan-zyp-json-ref-03) for modular configuration
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

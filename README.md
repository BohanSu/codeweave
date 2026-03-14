# 🧶 CodeWeave / 编织代码

[![npm version](https://badge.fury.io/js/codeweave.svg)](https://www.npmjs.com/package/codeweave)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/BohanSu/codeweave)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/BohanSu/codeweave)

**Powerful TypeScript CLI tool for visualizing dependencies in JavaScript and TypeScript projects.**
**强大的 TypeScript CLI 工具，用于可视化 JavaScript 和 TypeScript 项目中的依赖关系。**

Analyze import relationships, detect circular dependencies, and export dependency graphs as JSON, ASCII trees, or interactive HTML reports.
分析导入关系，检测循环依赖，并将依赖图导出为 JSON、ASCII 树或交互式 HTML 报告。

---

## 📚 Table of Contents / 目录

- [Why CodeWeave? / 为什么选择 CodeWeave?](#why-codeweave--为什么选择-codeweave)
- [Features / 功能特性](#features--功能特性)
- [Installation / 安装](#installation--安装)
- [Quick Start / 快速开始](#quick-start--快速开始)
- [Usage Examples / 使用示例](#usage-examples--使用示例)
- [Export Formats / 导出格式](#export-formats--导出格式)
- [CLI Options / 命令行选项](#cli-options--命令行选项)
- [Development / 开发](#development--开发)
- [Contributing / 贡献](#contributing--贡献)
- [License / 许可证](#license--许可证)

---

## 🎯 Why CodeWeave? / 为什么选择 CodeWeave?

### English
Modern JavaScript/TypeScript projects can grow complex with hundreds of interdependent files. Understanding your dependency structure is crucial for:

- **Refactoring safely** — know what breaks before you change code
- **Detecting circular dependencies** — eliminate infinite loops at module load time
- **Code organization** — identify modules with excessive coupling
- **Onboarding new developers** — visualize how your project is organized
- **Architecture documentation** — auto-generate dependency graphs

CodeWeave provides a fast, zero-dependency solution for all these tasks.

### 中文
现代 JavaScript/TypeScript 项目通常包含数百个相互依赖的文件，理解依赖结构至关重要：

- **安全重构** — 在修改代码之前了解会破坏什么
- **检测循环依赖** — 消除模块加载时的无限循环
- **代码组织** — 识别过度耦合的模块
- **新开发者入职** — 可视化项目组织结构
- **架构文档** — 自动生成依赖图

CodeWeave 为所有这些任务提供了快速的零依赖解决方案。

---

## ✨ Features / 功能特性

### English
- 📊 **Dependency Analysis** — Extracts and analyzes import/export relationships from `.js`, `.ts`, `.jsx`, `.tsx` files
- 🔄 **Cycle Detection** — Detects circular dependencies using depth-first search algorithm
- 📏 **Depth Computation** — Calculates dependency depth for each module to identify deeply nested code
- 📤 **Multiple Export Formats**:
  - **JSON** — Structured data for programmatic consumption and tooling integration
  - **Tree (ASCII)** — Human-readable terminal output with clear hierarchy
  - **HTML** — Interactive visual report with statistics, graphs, and responsive design
- ⚡ **Fast & Lightweight** — Zero-runtime dependencies for core logic, processes 1000+ files in seconds

### 中文
- 📊 **依赖分析** — 从 `.js`、`.ts`、`.jsx`、`.tsx` 文件中提取和分析导入/导出关系
- 🔄 **循环检测** — 使用深度优先搜索算法检测循环依赖
- 📏 **深度计算** — 计算每个模块的依赖深度，识别深度嵌套的代码
- 📤 **多种导出格式**：
  - **JSON** — 用于程序化消费和工具集成的结构化数据
  - **树形（ASCII）** — 具有清晰层次结构的人类可读终端输出
  - **HTML** — 带有统计信息、图表和响应式设计的交互式可视化报告
- ⚡ **快速轻量** — 核心逻辑零运行时依赖，数秒内处理 1000+ 文件

---

## 📦 Installation / 安装

### English

#### Global Installation (Recommended)

```bash
npm install -g codeweave
```

After global installation, you can run `codeweave` from anywhere:

```bash
codeweave ./src
```

#### Local Installation

```bash
npm install --save-dev codeweave
```

Then run with npx:

```bash
npx codeweave ./src
```

#### Build from Source

```bash
git clone https://github.com/BohanSu/codeweave.git
cd codeweave
npm install
npm run build
npm link
```

### 中文

#### 全局安装（推荐）

```bash
npm install -g codeweave
```

全局安装后，可以在任何位置运行 `codeweave`：

```bash
codeweave ./src
```

#### 本地安装

```bash
npm install --save-dev codeweave
```

然后使用 npx 运行：

```bash
npx codeweave ./src
```

#### 从源码构建

```bash
git clone https://github.com/BohanSu/codeweave.git
cd codeweave
npm install
npm run build
npm link
```

---

## 🚀 Quick Start / 快速开始

### English

#### Analyze Your Project

```bash
# Tree view (default)
codeweave ./src

# Export as JSON
codeweave ./src --format json --output deps.json

# Generate HTML report
codeweave ./src --format html --output report.html

# Limit dependency depth
codeweave ./src --format tree --depth 2
```

### 中文

#### 分析您的项目

```bash
# 树形视图（默认）
codeweave ./src

# 导出为 JSON
codeweave ./src --format json --output deps.json

# 生成 HTML 报告
codeweave ./src --format html --output report.html

# 限制依赖深度
codeweave ./src --format tree --depth 2
```

---

## 📚 Usage Examples / 使用示例

### English

#### Basic Analysis

```bash
# Analyze the src directory
codeweave ./src

# Analyze multiple directories
codeweave ./src ./test ./lib

# Exclude specific patterns
codeweave ./src --exclude "**/*.test.ts" --exclude "dist/**"
```

#### JSON Export for Tooling Integration

```bash
# Export to JSON for CI/CD pipelines
codeweave ./src --format json --output analysis.json
```

#### HTML Report Generation

```bash
# Generate interactive report
codeweave ./src --format html --output report.html
```

### 中文

#### 基本分析

```bash
# 分析 src 目录
codeweave ./src

# 分析多个目录
codeweave ./src ./test ./lib

# 排除特定模式
codeweave ./src --exclude "**/*.test.ts" --exclude "dist/**"
```

#### JSON 导出用于工具集成

```bash
# 导出为 JSON 用于 CI/CD 流水线
codeweave ./src --format json --output analysis.json
```

#### HTML 报告生成

```bash
# 生成交互式报告
codeweave ./src --format html --output report.html
```

---

## 📤 Export Formats / 导出格式

### JSON Format / JSON 格式

Perfect for programmatic processing and CI/CD integration.

适用于程序化处理和 CI/CD 集成。

```json
{
  "files": [
    {
      "path": "src/index.ts",
      "depth": 2,
      "dependencies": [
        {
          "import": "./utils",
          "type": "internal",
          "resolved": "src/utils.ts"
        }
      ]
    }
  ],
  "edges": 15,
  "cycles": [],
  "averageDepth": 1.3,
  "maxDepth": 3
}
```

### Tree Format / 树形格式

Human-readable hierarchy with clear visual structure.

具有清晰视觉结构的可读层级。

```
src/index.ts (depth: 2)
  ├── ./utils.ts [internal]
  │   └── ./helpers.js [internal]
  └── lodash [external]
```

### HTML Format / HTML 格式

Interactive web-based report with statistics dashboard.

带有统计仪表板的交互式网页报告。

---

## ⚙️ CLI Options / 命令行选项

### English

```
Usage: codeweave [options] <path>

Arguments:
  path                    Path to the project directory to analyze

Options:
  -f, --format <format>   Output format: json, tree, or html (default: "tree")
  -d, --depth <number>    Maximum dependency depth to display
  -o, --output <file>     Write output to file instead of stdout
  --no-color              Disable colored output
  -h, --help              Display help for command
  -V, --version           Display version number
```

### 中文

```
用法: codeweave [选项] <路径>

参数:
  path                    要分析的项目目录路径

选项:
  -f, --format <格式>     输出格式：json、tree 或 html（默认："tree"）
  -d, --depth <数字>      要显示的最大依赖深度
  -o, --output <文件>     将输出写入文件而不是标准输出
  --no-color              禁用彩色输出
  -h, --help              显示命令帮助
  -V, --version           显示版本号
```

---

## 🛠️ Development / 开发

### English

#### Prerequisites

- Node.js >= 18
- npm >= 9

#### Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

### 中文

#### 前置要求

- Node.js >= 18
- npm >= 9

#### 设置

```bash
# 安装依赖
npm install

# 构建 TypeScript
npm run build

# 运行测试
npm test

# 运行代码检查
npm run lint
```

---

## 🤝 Contributing / 贡献

### English

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Run `npm test` to ensure everything passes
5. Run `npm run lint` to check code style
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### 中文

欢迎贡献！请遵循以下指南：

1. Fork 该仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 进行更改并添加测试
4. 运行 `npm test` 确保所有测试通过
5. 运行 `npm run lint` 检查代码风格
6. 提交您的更改 (`git commit -m 'Add amazing feature'`)
7. 推送到分支 (`git push origin feature/amazing-feature`)
8. 打开 Pull Request

---

## 📄 License / 许可证

MIT License - see [LICENSE](LICENSE) file.

MIT 许可证 - 参见 [LICENSE](LICENSE) 文件。

---

## 📞 Support / 支持

### English
- 📖 [Documentation](https://github.com/BohanSu/codeweave)
- 🐛 [Issue Tracker](https://github.com/BohanSu/codeweave/issues)
- 💬 [Discussions](https://github.com/BohanSu/codeweave/discussions)

### 中文
- 📖 [文档](https://github.com/BohanSu/codeweave)
- 🐛 [问题追踪](https://github.com/BohanSu/codeweave/issues)
- 💬 [讨论](https://github.com/BohanSu/codeweave/discussions)

---

**Happy dependency analysis! 🧶**
**祝您依赖分析愉快！🧶**

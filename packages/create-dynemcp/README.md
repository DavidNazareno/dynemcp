# @dynemcp/create-dynemcp

A CLI tool to create new DyneMCP projects with predefined templates.

## Installation

```bash
npm install -g @dynemcp/create-dynemcp
```

## Usage

```bash
# Create a new project
create-dynemcp my-mcp-project

# Create with specific template
create-dynemcp my-calculator --template calculator

# Skip prompts
create-dynemcp my-project --yes

# Skip dependency installation
create-dynemcp my-project --skip-install
```

## Templates

### Default Template
A minimal setup with example tools, resources, and prompts.

### Calculator Template
A comprehensive calculator with mathematical tools and reference resources.

## Options

- `--template <name>`: Choose template (default, calculator)
- `--skip-install`: Skip installing dependencies
- `--yes`: Skip all prompts and use defaults
- `--help`: Show help information
- `--version`: Show version information

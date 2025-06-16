# Contributing to DyneMCP

Thank you for your interest in contributing to DyneMCP! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct. Please be respectful and considerate of others.

## How to Contribute

### Reporting Bugs

If you find a bug, please report it by creating an issue using the bug report template. Before creating a new issue, please check if it already exists.

### Suggesting Features

If you have an idea for a new feature, please create an issue using the feature request template.

### Pull Requests

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

### Development Workflow

1. Clone the repository

   ```bash
   git clone https://github.com/davidnazareno/dynemcp.git
   cd dynemcp
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Run development mode

   ```bash
   pnpm run dev
   ```

4. Run tests

   ```bash
   pnpm run test
   ```

5. Format code
   ```bash
   pnpm run format && pnpm run eslint:fix
   ```

## Style Guide

### Code Style

This project uses Prettier and ESLint for code formatting and linting. Please ensure your code follows these standards by running:

```bash
pnpm run format && pnpm run eslint:fix
```

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line

## Testing

Please ensure all tests pass before submitting a pull request:

```bash
pnpm run test
```

Add new tests for new features or bug fixes.

## Documentation

Update documentation to reflect any changes. This includes:

- README.md
- Code comments
- JSDoc annotations

## License

By contributing to DyneMCP, you agree that your contributions will be licensed under the project's [MIT License with Attribution](LICENSE).

## Questions?

If you have any questions, please create an issue using the question template or reach out to the maintainers.

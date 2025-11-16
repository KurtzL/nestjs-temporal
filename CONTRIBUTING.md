# Contributing to nestjs-temporal

Thank you for your interest in contributing to nestjs-temporal! This document provides guidelines and instructions for contributing.

## Commit Message Format

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. All commit messages must follow this format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

The following types are allowed:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- **ci**: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, GitHub Actions)
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Rules

1. **Type must be lowercase** (e.g., `fix`, not `Fix` or `FIX`)
2. **Type is required** and must be one of the allowed types listed above
3. **Description is required** and must be in lowercase (except for proper nouns)
4. **Description must not end with a period**
5. **Header must not exceed 100 characters**
6. **Scope is optional** and should be lowercase
7. **Body and footer are optional** but must be separated by blank lines if present

### Examples

✅ **Valid commit messages:**

```
fix: resolve worker shutdown issue
feat: add support for multiple workers
docs: update README with usage examples
refactor: improve type safety in TemporalExplorer
fix(worker): handle connection errors gracefully
feat(client): add named client support

docs: add comprehensive JSDoc documentation

This commit adds JSDoc comments to all public APIs
to improve code documentation and IDE support.
```

❌ **Invalid commit messages:**

```
INVALID: test message                    # Type must be lowercase
fix:                                    # Description is required
Fix: resolve issue                      # Type must be lowercase
fix: Resolve issue.                     # Description ends with period
feat: Add new feature                   # Description should be lowercase
invalid-type: test message              # Type not in allowed list
```

### Enforced by Husky

This project uses [Husky](https://typicode.github.io/husky/) to automatically validate commit messages before they are accepted. If your commit message doesn't follow the conventional commit format, your commit will be rejected with helpful error messages.

### Bypassing the Hook (Not Recommended)

If you absolutely need to bypass the commit message validation (e.g., for merge commits), you can use:

```bash
git commit --no-verify -m "your message"
```

However, this should be avoided in normal development workflow.

## Development Workflow

1. Fork the repository
2. Create a feature branch from `main` or `develop`
3. Make your changes
4. Write or update tests as needed
5. Ensure all tests pass: `npm test`
6. Ensure code follows linting rules: `npm run lint`
7. Format code: `npm run format`
8. Commit your changes using conventional commit format
9. Push to your fork and create a Pull Request

## Code Style

- Follow the existing code style
- Use TypeScript strict mode
- Add JSDoc comments for public APIs
- Write meaningful variable and function names
- Keep functions focused and small

## Testing

- Write tests for new features
- Ensure all existing tests pass
- Aim for high test coverage

## Questions?

If you have questions about contributing, please open an issue or contact the maintainers.

Thank you for contributing! 🎉


# Release Notes - v2.1.0

## 🎉 New Features

### NestJS 11 Support
- Added support for NestJS 11 (latest stable version)
- Maintains backward compatibility with NestJS 8, 9, and 10
- Updated peerDependencies to include `^11.0.0`
- All tests passing with NestJS 11.1.9

## ✨ Improvements

### Code Quality
- Improved type safety by replacing `any` types with `unknown` and proper type guards
- Enhanced error handling in TemporalExplorer and client utilities
- Better null/undefined checks throughout the codebase
- Improved worker lifecycle management

### Documentation
- Added comprehensive JSDoc documentation to all public APIs
- Documented TemporalModule, TemporalExplorer, and all decorators
- Added usage examples in JSDoc comments
- Created CONTRIBUTING.md with commit message guidelines

### Developer Experience
- Enforced conventional commit format using Husky and commitlint
- Added strict commit message validation rules
- Improved ESLint configuration
- Added prepare script for automatic Husky installation

## 🐛 Bug Fixes

- Fixed ESLint configuration issue with jest.config.js
- Fixed TypeScript compilation errors for WorkerOptions
- Improved handling of optional worker properties
- Better error messages for duplicate activity detection

## 📦 Dependencies

- Updated devDependencies to NestJS 11.1.9 for testing
- All existing dependencies remain compatible

## 🔄 Migration Guide

No breaking changes! This release is fully backward compatible. If you're using NestJS 8, 9, or 10, you can upgrade without any code changes.

To use with NestJS 11, simply update your NestJS dependencies:
```bash
npm install @nestjs/common@^11.0.0 @nestjs/core@^11.0.0
```

## 📝 Full Changelog

### Features
- `feat: add support for NestJS 11` - Support for NestJS 11 with backward compatibility

### Documentation
- `docs: add JSDoc documentation to decorators` - Comprehensive documentation for all decorators
- `docs: add comprehensive JSDoc documentation to TemporalModule` - Module documentation

### Code Quality
- `refactor: improve code quality and error handling in TemporalExplorer` - Enhanced error handling and type safety
- `refactor: improve type safety by replacing any with unknown` - Better type safety
- `refactor: improve error handling in client utilities` - Improved client error handling

### CI/CD
- `ci: enforce conventional commits with husky and commitlint` - Commit message validation

### Bug Fixes
- `fix: exclude jest.config.js from ESLint parsing` - Fixed ESLint configuration

---

**Full Changelog**: https://github.com/KurtzL/nestjs-temporal/compare/v2.0.1...v2.1.0


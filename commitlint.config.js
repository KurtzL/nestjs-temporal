module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce conventional commit format
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
    // Require type to be lowercase
    'type-case': [2, 'always', 'lower-case'],
    // Require type to not be empty
    'type-empty': [2, 'never'],
    // Require scope to be lowercase
    'scope-case': [2, 'always', 'lower-case'],
    // Require subject to not be empty
    'subject-empty': [2, 'never'],
    // Require subject to not end with a period
    'subject-full-stop': [2, 'never', '.'],
    // Require subject to start with a lowercase letter
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    // Header must not exceed 100 characters
    'header-max-length': [2, 'always', 100],
    // Body must have a blank line before it
    'body-leading-blank': [1, 'always'],
    // Footer must have a blank line before it
    'footer-leading-blank': [1, 'always'],
  },
};

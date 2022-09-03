module.exports = {
  extends: ['@heise', 'plugin:react-hooks/recommended'],
  root: true,
  parserOptions: {
    allowAutomaticSingleRunInference: true,
    project: ['./tsconfig.json'],
  },
  rules: {
    yoda: ['error', 'never'],
    'unicorn/no-fn-reference-in-iterator': 'off',
    'react/react-in-jsx-scope': 'off',
    'node/no-missing-import': 'off',
    'no-return-await': 'error',
    'unicorn/numeric-separators-style': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/no-abusive-eslint-disable': 'off',
    'unicorn/no-array-method-this-argument': 'off',
    'unicorn/consistent-destructuring': 'off',
    'no-restricted-syntax': [
      'error',
      {
        selector: `ImportDeclaration[source.raw=/['"]\\.[^a-z]*['"]/]`,
        message: 'Keine "."-Importe',
      },
      {
        // die Slashes sehen so komisch aus, weil:
        // https://eslint.org/docs/developer-guide/selectors#known-issues
        selector: `ImportDeclaration[source.raw=/@busse\\u002F.*\\u002Fsrc\\u002F/]`,
        message: 'Keine "src"-Importe. Ersetze "/src/" durch "/dist/".',
      },
    ],
  },
  overrides: [
    {
      files: ['jest.config.ts', 'jest.config.*.ts'],
      rules: {
        'node/no-extraneous-import': 'off',
        'node/no-unpublished-import': 'off',
      },
    },
    {
      files: ['webpack*.js'],
      rules: {
        '@typescript-eslint/no-unsafe-call': 'off',
        'node/no-extraneous-require': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
    },
    {
      files: ['*.spec.ts', '*.spec.tsx'],
      rules: {
        '@typescript-eslint/unbound-method': 'off',
      },
    },
    {
      files: ['*.dto.ts'],
      rules: {
        '@typescript-eslint/no-magic-numbers': 'off',
      },
    },
    {
      files: ['*.spec.ts', '*.spec.tsx', '*.e2e.ts', '*.test.ts'],
      rules: {
        'node/no-unpublished-import': 'off',
      },
    },
    {
      files: ['*.stories.tsx'],
      rules: {
        'toplevel/no-toplevel-side-effect': 'off',
      },
    },
  ],
}

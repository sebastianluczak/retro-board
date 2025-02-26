import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      'object-curly-spacing': ['error', 'always'], // Enforce spaces inside {}
      'indent': ['error', 2],
      'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
      'comma-dangle': ['error', 'always-multiline'],
      'arrow-parens': ['error', 'always'],
      'max-len': ['warn', { 'code': 128 }],
      '@typescript-eslint/no-unused-vars': ['error'],
      'consistent-return': 'error',
      'padding-line-between-statements': [
        'error',
        { 'blankLine': 'always', 'prev': '*', 'next': 'return' },
      ],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    },
  },
];

export default eslintConfig;

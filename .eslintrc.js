module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        'airbnb',
        'airbnb-typescript'
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "project": "./tsconfig.json"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "semi": ['error', 'never'],
        'linebreak-style': ['off', 'unix'],
        '@typescript-eslint/semi': ['error', 'never'],
        quotes: ['error', 'single', { allowTemplateLiterals: true }],
    }
};

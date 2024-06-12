/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true
  },

  
  // Base config
  extends: ["next/core-web-vitals",
  "plugin:eslint-plugin-next-on-pages/recommended",
  "eslint:recommended",
  "eslint-plugin-react/recommended",
  "eslint-config-standard-with-typescript",
  "airbnb",
  "airbnb-typescript/base",
  "prettier",
  "plugin:eslint-plugin-no-template-curly-in-string-fix"
],
  rules: {
    "@typescript-eslint/no-floating-promises": "error",
    "quotes": [2, "double", { "avoidEscape": true }],
    "comma-dangle": ["error", "never"],
    "no-console": "warn",
    "react/jsx-props-no-spreading": "off",
    "max-params": ["error", 3],
    "prefer-destructuring": ["error", { "object": true, "array": false }],
    "no-implicit-globals": ["error", { "lexicalBindings": true }],
    "no-lonely-if": "error",
    "import/order": "error",
    "sort-imports": "off",
    "no-void": ["off"],
    "prefer-template": "error",
    "curly": ["error", "all"],
    "react/display-name": "off",
    "@typescript-eslint/dot-notation": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "no-undef-init": "error",
    "import/no-default-export": "off",
    "import/prefer-default-export": "off",
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    "react/function-component-definition": [
      2,
      {
        "namedComponents": "arrow-function",
        "unnamedComponents": "arrow-function"
      }
    ]
  },
  overrides: [
    // React
    {
      files: ["**/*.{js,jsx,ts,tsx}"],
      plugins: ["react", "jsx-a11y", "eslint-plugin-next-on-pages", "@typescript-eslint"],
      extends: [
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended"
      ],
      settings: {
        react: {
          version: "detect"
        },
        formComponents: ["Form"],
        linkComponents: [
          { name: "Link", linkAttribute: "to" },
          { name: "NavLink", linkAttribute: "to" }
        ],
        "import/resolver": {
          typescript: {}
        }
      }
    },

    
    // Typescript
    {
      files: ["**/*.{ts,tsx}"],
      plugins: ["@typescript-eslint", "import"],
      parser: "@typescript-eslint/parser",
      settings: {
        "import/internal-regex": "^~/",
        "import/resolver": {
          node: {
            extensions: [".ts", ".tsx"]
          },
          typescript: {
            alwaysTryTypes: true
          }
        }
      },
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript"
      ]
    },

    // Node
    {
      files: [".eslintrc.js"],
      env: {
        node: true
      }
    }
  ]
};

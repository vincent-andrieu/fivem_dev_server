import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    {
        ignores: ["**/eslint.config.js", "**/rollup.config.js"]
    },
    ...compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"),
    {
        plugins: {
            "@typescript-eslint": typescriptEslintEslintPlugin,
            prettier
        },

        languageOptions: {
            globals: {
                ...globals.node
            },

            parser: tsParser,
            ecmaVersion: 5,
            sourceType: "module",

            parserOptions: {
                project: "tsconfig.json",
                tsconfigRootDir: __dirname
            }
        },

        rules: {
            "prettier/prettier": ["error"],
            "@typescript-eslint/interface-name-prefix": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-empty-function": "off",

            indent: [
                "error",
                4,
                {
                    SwitchCase: 1
                }
            ],

            "linebreak-style": ["error", "unix"],
            semi: ["error", "always"],
            curly: ["error", "all"],
            "nonblock-statement-body-position": ["error", "below"],
            "comma-dangle": ["error", "never"],
            "eol-last": ["error", "always"],

            "@typescript-eslint/naming-convention": [
                "warn",
                {
                    selector: "default",
                    format: ["camelCase"]
                },
                {
                    selector: "variable",
                    format: ["camelCase", "UPPER_CASE"]
                },
                {
                    selector: "typeLike",
                    format: ["PascalCase"]
                },
                {
                    selector: "enumMember",
                    format: ["UPPER_CASE"]
                },
                {
                    selector: "import",
                    format: []
                },
                {
                    selector: "parameter",
                    format: null,
                    modifiers: ["unused"],

                    custom: {
                        regex: "^_",
                        match: true
                    }
                },
                {
                    selector: "classProperty",
                    modifiers: ["static"],
                    format: ["camelCase", "PascalCase"]
                },
                {
                    selector: "classProperty",
                    modifiers: ["static", "private"],
                    format: ["camelCase"],
                    leadingUnderscore: "require"
                },
                {
                    selector: "memberLike",
                    modifiers: ["private"],
                    format: ["camelCase"],
                    leadingUnderscore: "require"
                },
                {
                    selector: "memberLike",
                    modifiers: ["protected"],
                    format: ["camelCase"],
                    leadingUnderscore: "require"
                },
                {
                    selector: ["property"],
                    modifiers: ["public"],
                    format: ["camelCase"],
                    leadingUnderscore: "allow",

                    filter: {
                        regex: "^_id$",
                        match: true
                    }
                },
                {
                    selector: ["property"],
                    modifiers: ["public"],
                    format: ["camelCase"],
                    leadingUnderscore: "forbid",

                    filter: {
                        regex: "(?!_id)",
                        match: true
                    }
                }
            ]
        }
    }
];

module.exports = {
    "env": {
        "es6": true
    },
    "extends": [
        "@winfe/eslint-config-winex/eslintrc.vue.js",
        "@winfe/eslint-config-winex/eslintrc.typescript-vue.js",
        "prettier"
    ],
    "globals": {
        "use": true
    },
    "ignorePatterns": [
        "node_modules",
        "dist",
        "fixtures",
        "**/*/*.md"
    ],
    "parserOptions": {
        "ecmaVersion": 2017
    },
    "rules": {
        "complexity": [
            "warn",
            {
                "max": 10
            }
        ],
        "prettier/prettier": [
            "error",
            {
            }
        ]
    }
};
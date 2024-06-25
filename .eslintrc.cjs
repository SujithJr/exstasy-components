/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
    root: true,
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/eslint-config-typescript',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    globals: {
        __dirname: true,
    },
    rules: {
        'vue/max-attributes-per-line': [
            'error', {
                singleline: {
                    max: 2,
                },
                multiline: {
                    max: 1,
                },
            },
        ],
        'vue/first-attribute-linebreak': [
            'error',
            {
                singleline: 'ignore',
                multiline: 'below',
            },
        ],
        'vue/html-closing-bracket-spacing': [
            'error',
            {
                startTag: 'never',
                endTag: 'never',
                selfClosingTag: 'always',
            },
        ],
        'vue/html-closing-bracket-newline': [
            'error',
            {
                singleline: 'never',
                multiline: 'always',
                selfClosingTag: {
                    singleline: 'never',
                    multiline: 'always',
                },
            },
        ],
        'vue/html-indent': [
            'error',
            'tab',
            {
                attribute: 1,
                baseIndent: 1,
                closeBracket: 0,
                alignAttributesVertically: true,
                ignores: [],
            },
        ],
        'vue/no-multi-spaces': [
            'error',
            { ignoreProperties: false },
        ],
        'vue/attribute-hyphenation': [
            'error',
            'always',
            { ignore: [] },
        ],
        'vue/require-explicit-emits': [
            'error',
            { allowProps: false },
        ],
        'vue/v-on-event-hyphenation': [
            'error',
            'always',
            {
                autofix: true,
                ignore: [],
            },
        ],
        'vue/attributes-order': [
            'error',
            {
                order: [
                    'DEFINITION',
                    'LIST_RENDERING',
                    'CONDITIONALS',
                    'TWO_WAY_BINDING',
                    'RENDER_MODIFIERS',
                    'GLOBAL',
                    ['UNIQUE', 'SLOT'],
                    'OTHER_DIRECTIVES',
                    'EVENTS',
                    'CONTENT',
                    'ATTR_DYNAMIC',
                    'ATTR_STATIC',
                    'ATTR_SHORTHAND_BOOL',
                ],
                alphabetical: false,
            },
        ],
        'vue/block-order': [
            'error',
            { order: ['script', 'template', 'style'] },
        ],
        'vue/component-api-style': [
            'error',
            ['script-setup', 'composition'],
        ],
        'vue/define-macros-order': [
            'error',
            {
                order: ['defineProps', 'defineEmits'],
                defineExposeLast: false,
            },
        ],
        'vue/enforce-style-attribute': [
            'error',
            { allow: ['scoped'] },
        ],
        'vue/no-v-html': 'off',
        'vue/no-dupe-keys': 'off',
        'vue/html-end-tags': 'error',
        'vue/require-prop-types': 'error',
        'vue/require-default-prop': 'off',
        'vue/prefer-import-from-vue': 'error',
        'vue/one-component-per-file': 'error',
        'vue/multi-word-component-names': 'off',
        'vue/no-v-text-v-html-on-component': 'off',
        'vue/this-in-template': ['error', 'never'],
        'vue/prop-name-casing': ['error', 'camelCase'],
        'vue/mustache-interpolation-spacing': ['error', 'always'],
        'vue/no-spaces-around-equal-signs-in-attribute': ['error'],
        'vue/component-definition-name-casing': ['error', 'PascalCase'],
        'vue/component-name-in-template-casing': ['error', 'kebab-case', {
            registeredComponentsOnly: true,
            ignores: [],
            globals: ['RouterView', 'RouterLink', 'GLink', 'GIcon'],
        }],
        'vue/html-quotes': [
            'error',
            'double',
            { avoidEscape: true },
        ],

        // Display error for deprecated api's
        'vue/no-deprecated-filter': 'error',
        'vue/no-deprecated-events-api': 'error',
        'vue/no-deprecated-slot-attribute': 'error',
        'vue/no-v-for-template-key-on-child': 'error',
        'vue/no-deprecated-functional-template': 'error',
        'vue/no-deprecated-v-on-native-modifier': 'error',
        'vue/no-deprecated-dollar-listeners-api': 'error',

        // JS
        'no-var': 'error',
        'no-console': 'off',
        // 'no-console': [
        //     'error',
        //     { allow: ['warn', 'error'] }
        // ],
        'array-bracket-spacing': ['error', 'never'],
        'array-callback-return': [
            'error',
            {
                allowImplicit: false,
                checkForEach: false,
            },
        ],
        'arrow-spacing': [
            'error',
            {
                before: true,
                after: true,
            },
        ],
        'block-spacing': ['error', 'always'],
        'brace-style': [
            'error',
            '1tbs',
            { allowSingleLine: true },
        ],
        camelcase: [
            'error',
            {
                // allow: ['^UNSAFE_'],
                properties: 'always',
                ignoreGlobals: true,
            },
        ],
        'comma-dangle': [
            'error',
            {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'always-multiline',
            },
        ],
        'comma-spacing': [
            'error',
            {
                before: false,
                after: true,
            },
        ],
        'comma-style': ['error', 'last'],
        'computed-property-spacing': [
            'error',
            'never',
            { enforceForClassMembers: true },
        ],
        'constructor-super': 'error',
        curly: ['error', 'multi-line'],
        'default-case-last': 'error',
        'dot-location': ['error', 'property'],
        'eol-last': 'error',
        eqeqeq: [
            'error',
            'always',
            { null: 'ignore' },
        ],
        'func-call-spacing': ['error', 'never'],
        indent: [
            'error',
            4,
            {
                SwitchCase: 1,
                VariableDeclarator: 1,
                outerIIFEBody: 1,
                MemberExpression: 1,
                FunctionDeclaration: {
                    parameters: 1,
                    body: 1,
                },
                FunctionExpression: {
                    parameters: 1,
                    body: 1,
                },
                CallExpression: { arguments: 1 },
                ArrayExpression: 1,
                ObjectExpression: 1,
                ImportDeclaration: 1,
                flatTernaryExpressions: false,
                ignoreComments: false,
                ignoredNodes: [
                    'TemplateLiteral *',
                ],
                offsetTernaryExpressions: true,
            },
        ],
        'key-spacing': [
            'error',
            {
                beforeColon: false,
                afterColon: true,
            },
        ],
        'keyword-spacing': [
            'error',
            {
                before: true,
                after: true,
            },
        ],
        'multiline-ternary': ['error', 'always-multiline'],
        // 'new-cap': [
        //     'error',
        //     {
        //         newIsCap: true,
        //         capIsNew: false,
        //         properties: true
        //     }
        // ],
        // 'new-parens': 'error',
        'no-array-constructor': 'error',
        'no-async-promise-executor': 'error',
        'no-caller': 'error',
        'no-case-declarations': 'error',
        'no-class-assign': 'error',
        'no-compare-neg-zero': 'error',
        'no-cond-assign': 'error',
        'no-const-assign': 'error',
        'no-constant-condition': [
            'error',
            { checkLoops: false },
        ],
        'no-delete-var': 'error',
        'no-dupe-args': 'error',
        'no-dupe-class-members': 'error',
        'no-dupe-keys': 'error',
        'no-duplicate-case': 'error',
        'no-empty-character-class': 'error',
        'no-empty-pattern': 'error',
        'no-eval': 'error',
        'no-extra-boolean-cast': 'error',
        'no-extra-parens': ['error', 'functions'],
        'no-lone-blocks': 'error',
        'no-import-assign': 'error',
        'no-mixed-operators': [
            'error',
            {
                groups: [
                    ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
                    ['&&', '||'],
                    ['in', 'instanceof'],
                ],
                allowSamePrecedence: true,
            },
        ],
        'no-mixed-spaces-and-tabs': 'error',
        'no-multi-spaces': 'error',
        'no-multi-str': 'error',
        'no-multiple-empty-lines': [
            'error',
            {
                max: 1,
                maxBOF: 0,
                maxEOF: 0,
            },
        ],
        'no-new': 'error',
        'no-new-func': 'error',
        'no-new-symbol': 'error',
        'no-new-object': 'error',
        'space-infix-ops': 'error',
        'no-new-wrappers': 'error',
        'no-redeclare': [
            'error',
            { builtinGlobals: false },
        ],
        'no-tabs': 0,
        'no-return-assign': ['error', 'except-parens'],
        'no-trailing-spaces': 'error',
        'no-unexpected-multiline': 'error',
        // 'no-unused-vars': [
        //     'error',
        //     {
        //         args: 'none',
        //         caughtErrors: 'none',
        //         ignoreRestSiblings: true,
        //         vars: 'all'
        //     }
        // ],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'padded-blocks': [
            'error',
            {
                blocks: 'never',
                switches: 'never',
                classes: 'never',
            },
        ],
        'prefer-const': [
            'error',
            { destructuring: 'all' },
        ],
        'quote-props': ['error', 'as-needed'],
        quotes: [
            'error',
            'single',
            {
                avoidEscape: true,
                allowTemplateLiterals: false,
            },
        ],
        'rest-spread-spacing': ['error', 'never'],
        semi: ['error', 'never'],
        'semi-spacing': [
            'error',
            {
                before: false,
                after: true,
            },
        ],
        'space-before-blocks': ['error', 'always'],
        'space-before-function-paren': ['error', 'always'],
        'space-in-parens': ['error', 'never'],
        'spaced-comment': [
            'error',
            'always',
            {
                line: {
                    markers: ['*package', '!', '/', ',', '='],
                },
                block: {
                    balanced: true,
                    markers: ['*package', '!', ',', ':', '::', 'flow-include'],
                    exceptions: ['*'],
                },
            },
        ],
        yoda: ['error', 'never'],
        'template-curly-spacing': ['error', 'never'],
        'no-whitespace-before-property': 'error',
        'object-curly-spacing': ['error', 'always'],
        'no-duplicate-imports': 'error',
    },
}

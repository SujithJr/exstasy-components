import { fileURLToPath, URL } from 'node:url'

import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import * as path from 'path'

const filesNeedToExclude = [
    'src/playground/AutocompleteExample.vue',
    'src/playground/DropdownExample.vue',
    'src/playground/TooltipExample.vue',

    'src/playground/App.vue',
    'src/main.ts',

    // Under Development Files
    'src/components/UnderDevelopment/list.md',
    'src/components/UnderDevelopment/ExSwitch/ExSwitch.ts',
]

const filesPathToExclude = filesNeedToExclude.map((src) => {
    return fileURLToPath(new URL(src, import.meta.url))
})

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        vue(),
        dts(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        sourcemap: true,
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'EcstasyUI',
            formats: ['es', 'cjs'],
            fileName: format => `index${format === 'es' ? '.js' : '.cjs'}`,
            // fileName: format => `index.${format === 'cjs' ? 'cjs' : format + '.js'}`,
        },
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'src/index.ts'),
            },
            external: [
                'vue',
                ...filesPathToExclude,
            ],
            output: {
                exports: 'named',
                banner: '/*! Ecstasy UI by Sujith Kumar https://github.com/SujithJr */',
                globals: {
                    vue: 'Vue',
                },
            },
        },
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
})

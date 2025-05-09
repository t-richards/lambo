import * as esbuild from 'esbuild'

const workerEntryPoints = [
    // NOTE: Add extra worker entry points here if needed.
    // e.g., 'vs/language/json/json.worker.js'
    'vs/editor/editor.worker.js'
]

console.log('Building main files...')
esbuild.build({
    entryPoints: ['app/javascript/*.*'],
    bundle: true,
    minify: true,
    legalComments: 'none',
    format: 'esm',
    outdir: 'app/assets/builds',
    publicPath: '/assets',
    loader: {
        '.ttf': 'file',
    },
    assetNames: '[name]-[hash].digested',
    logLevel: 'info',
})

console.log('Building monaco files...')
esbuild.build({
    entryPoints: workerEntryPoints.map((entry) => `node_modules/monaco-editor/esm/${entry}`),
    bundle: true,
    minify: true,
    legalComments: 'none',
    format: 'iife',
    outdir: 'app/assets/builds/vs',
    publicPath: '/assets',
    logLevel: 'info',
})

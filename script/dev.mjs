import { context } from 'esbuild'

const workerEntryPoints = [
    // NOTE: Add extra worker entry points here if needed.
    // e.g., 'vs/language/json/json.worker.js'
    'vs/editor/editor.worker.js'
]

async function buildMain() {
    let ctx = await context({
        entryPoints: ['app/javascript/*.*'],
        bundle: true,
        minify: true,
        sourcemap: 'linked',
        legalComments: 'none',
        format: 'esm',
        outdir: 'app/assets/builds',
        publicPath: '/assets',
        loader: {
            '.ttf': 'file',
        },
        assetNames: '[name]-[hash].digested',
    })
    await ctx.watch()
    console.log('Building main files...')
}

async function buildMonaco() {
    let ctx = await context({
        entryPoints: workerEntryPoints.map((entry) => `node_modules/monaco-editor/esm/${entry}`),
        bundle: true,
        minify: true,
        sourcemap: 'linked',
        legalComments: 'none',
        format: 'iife',
        outdir: 'app/assets/builds/vs',
        publicPath: '/assets',
    })

    await ctx.watch()
    console.log('Building monaco files...')
}

// Run builds in the background.
buildMain()
buildMonaco()

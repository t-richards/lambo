import * as monaco from 'monaco-editor'

const workerMeta = document.querySelector('meta[name=monaco-worker-path]')?.getAttribute('content')

self.MonacoEnvironment = {
    getWorkerUrl: (_workerId, _label) => {
        if (typeof workerMeta !== 'string') {
            throw new Error('Worker path not found')
        }

        return workerMeta
    }
}

// editor content for demo purposes.
const value = `SELECT
    id,
    name,
    email
FROM
    users
WHERE
    created_at > '2023-01-01'
ORDER BY
    created_at DESC;
`

const startMonaco = () => {
    const container = document.getElementById('container')
    if (!container) {
        // TODO: report error somewhere
        return
    }
    if (typeof window.MONACO_VERSION !== 'undefined') {
        console.log('starting monaco editor, version:', window.MONACO_VERSION)
    }
    monaco.editor.create(container, {
        value,
        language: 'sql',
        automaticLayout: true,
        theme: 'vs-dark',
    })
}

startMonaco()

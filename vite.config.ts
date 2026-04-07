/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process'

const commitHash = (() => {
    try {
        return execSync('git rev-parse --short HEAD').toString().trim()
    } catch {
        return 'unknown'
    }
})()

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    define: {
        'import.meta.env.VITE_COMMIT_HASH': JSON.stringify(commitHash),
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: './tests/setup.ts',
    },
})

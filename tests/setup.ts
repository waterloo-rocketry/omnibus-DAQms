import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

// Radix Select uses hasPointerCapture which jsdom doesn't support
if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
}
if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {}
}
if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
}

afterEach(() => {
    cleanup()
})

import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../src/App'


describe('App', () => {
  it('renders the App component', () => {
    render(<App />)
    screen.debug()
  })
})

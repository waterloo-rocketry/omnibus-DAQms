import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const renderWithRouter = (ui: React.ReactNode, { route = '/' } = {}) => {
    return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

export { renderWithRouter }

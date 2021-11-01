import { cleanup, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import PageTitle from './PageTitle'

const exampleProps = {
    title: 'The Title',
}

afterEach(() => {
    cleanup()
})

describe('PageTitle Component', () => {
    it('should render', () => {
        const { queryByTestId } = render(<PageTitle />)
        const pageTitleComponent = queryByTestId('pageTitleWrapper')

        expect(pageTitleComponent).toBeTruthy()
    })

    it('should display the page title correctly', () => {
        const { queryByTestId } = render(<PageTitle {...exampleProps} />)
        const pageTitleComponent = queryByTestId('pageTitleWrapper')
        const headingElement = queryByTestId('pageTitleHeading')

        expect(pageTitleComponent).toContainElement(headingElement)
        expect(headingElement).toHaveTextContent(exampleProps.title)
    })
})

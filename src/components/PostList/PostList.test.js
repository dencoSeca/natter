import { cleanup, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import PostList from './PostList'

const exampleProps = {
    title: 'The Title',
}

afterEach(() => {
    cleanup()
})

describe('PostList Component', () => {
    it('should render correctly', () => {
        const { queryByTestId } = render(<PostList {...exampleProps} />)
        const postListWrapper = queryByTestId('postListWrapper')

        expect(postListWrapper).toBeTruthy()
    })

    it('should display the title prop correctly', () => {
        const { queryByTestId } = render(<PostList {...exampleProps} />)
        const postListHeading = queryByTestId('postListHeading')

        expect(postListHeading).toBeTruthy()
        expect(postListHeading).toHaveTextContent(exampleProps.title)
    })
})

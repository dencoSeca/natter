import { cleanup, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import Post from './Post'

const exampleProps = {
    author: 'Author',
    content: 'Content',
    createdAt: 'CreatedAt',
}

afterEach(() => {
    cleanup()
})

describe('Post Component', () => {
    it('should render correctly', () => {
        const { queryByTestId } = render(<Post {...exampleProps} />)
        const postWrapper = queryByTestId('postWrapper')

        expect(postWrapper).toBeTruthy()
    })

    it('should render the post content correctly', () => {
        const { queryByTestId } = render(<Post {...exampleProps} />)
        const contentElement = queryByTestId('postContent')

        expect(contentElement).toBeTruthy()
        expect(contentElement).toHaveTextContent(exampleProps.content)
    })

    it('should render the post author correctly', () => {
        const { queryByTestId } = render(<Post {...exampleProps} />)
        const authorElement = queryByTestId('postAuthor')

        expect(authorElement).toBeTruthy()
        expect(authorElement).toHaveTextContent(exampleProps.author)
    })

    it('should render the post created at date correctly', () => {
        const { queryByTestId } = render(<Post {...exampleProps} />)
        const createdAtElement = queryByTestId('postCreatedAt')

        expect(createdAtElement).toBeTruthy()
        expect(createdAtElement).toHaveTextContent(exampleProps.createdAt)
    })
})

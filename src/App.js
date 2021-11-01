import React from 'react'

// Styles
import './styles/normalize.css'
import './styles/typography.css'
import './styles/global.css'
import Layout from './styles/Layout.module.css'

// Components
import PageTitle from './components/PageTitle/PageTitle'
import PostList from './components/PostList/PostList'

const topPosts = [
    {
        author: 'Jack Dangers',
        content: 'Err... hello? Anybody here?',
        createdAt: '07/07/21',
    },
]

function App() {
    return (
        <div className="App" data-testid="app">
            <div className={Layout.container}>
                <PageTitle title="Natter" />
                <PostList title="Recent Posts" posts={topPosts} />
            </div>
        </div>
    )
}

export default App

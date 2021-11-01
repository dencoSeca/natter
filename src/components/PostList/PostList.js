import React from 'react'
// Styles

import styles from './PostList.module.css'
// Components
import Post from '../Post/Post'

function PostList({ title, posts }) {
    return (
        <div className={styles.wrapper} data-testid="postListWrapper">
            <h3 className={styles.title} data-testid="postListHeading">
                {title}
            </h3>
            {posts.map((post, i) => {
                const formattedDate = new Date(post.createdAt).toLocaleString(
                    'en-GB',
                    {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    }
                )

                return (
                    <Post
                        key={i}
                        author={post.author}
                        content={post.content}
                        createdAt={formattedDate}
                    />
                )
            })}
        </div>
    )
}

export default PostList

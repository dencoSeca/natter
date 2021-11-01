import React from 'react'

// Styles
import styles from './Post.module.css'

function Post({ author, content, createdAt }) {
    return (
        <div className={styles.wrapper} data-testid="postWrapper">
            <p className={styles.content} data-testid="postContent">
                {content}
            </p>
            <div className={styles.metadata}>
                <h4 className={styles.author} data-testid="postAuthor">
                    {author}
                </h4>
                <small className={styles.createdAt} data-testid="postCreatedAt">
                    {createdAt}
                </small>
            </div>
        </div>
    )
}

export default Post

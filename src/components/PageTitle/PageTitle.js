import React from 'react'

import styles from './PageTitle.module.css'

function PageTitle({ title }) {
    return (
        <div className={styles.titleWrapper} data-testid="pageTitleWrapper">
            <h1 className={styles.title} data-testid="pageTitleHeading">
                {title}
            </h1>
        </div>
    )
}

export default PageTitle

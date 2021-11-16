const express = require('express')
const app = express()
const { getScores, insertScore } = require('db')
const { getCurrentInvoke } = require('@vendia/serverless-express')

const TOP_SCORES_RETURNED = 15

app.get('/scores', async (req, res) => {
    console.log('somebody requested the high scores')
    const scores = await getScores(TOP_SCORES_RETURNED)

    res.json(scores)
})

app.post('/scores', async (req, res) => {
    console.log('somebody submitted a score')
    const { event } = getCurrentInvoke()
    const body = JSON.parse(event.body)
    if (body.name.length > 10) {
        console.log('name submitted longer than 10 characters\nreturning error')
        res.json({
            error: 'Name submitted is longer than 10 characters. Please submit a name 10 or less characters long.',
        })
    } else {
        const score = await insertScore(body.name, body.score)
        res.json(score)
    }
})

module.exports = app

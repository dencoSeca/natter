const client = require('data-api-client')
const uuid = require('uuid')

const connection = client({
    secretArn: process.env.SECRET_ARN,
    resourceArn: process.env.CLUSTER_ARN,
    database: process.env.DB_NAME,
})

const getScores = async scoresToReturn => {
    const params = { scoresToReturn }
    const result = await connection.query(
        'SELECT * FROM highscores ORDER BY score DESC LIMIT :scoresToReturn',
        params
    )

    return result.records
}

const insertScore = async (name, score) => {
    const newScore = {
        id: uuid.v4(),
        name,
        score,
        time: Date.now(),
    }
    const queryString =
        'INSERT INTO highscores (id, name, score, time) VALUES (:id, :name, :score, :time)'
    await connection.query(queryString, newScore)

    return newScore
}

module.exports = {
    getScores,
    insertScore,
}

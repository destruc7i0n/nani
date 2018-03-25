import popura from 'popura'
import jwt from 'jsonwebtoken'

export async function handler (event, context, callback) {
  const { body = '' } = event
  const parsedBody = JSON.parse(body)
  const { token, id, episode, status } = parsedBody
  const returnBody = (error, success, data = '') => JSON.stringify({
    error,
    success,
    data
  })

  // valid the input
  if (!token) return callback(null, {statusCode: 400, body: returnBody('Invalid token.', false)})
  if (!id || !episode || !status) return callback(null, {statusCode: 400, body: returnBody('Invalid payload.', false)})

  // decode jwt
  let decoded = {}
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'THIS_SHOULD_NEVER_BE_THE_KEY_IN_PRODUCTION')
  } catch (err) {
    return callback(null, {statusCode: 400, body: returnBody('Invalid token.', false)})
  }

  // grab from the jwt payload
  const { username, password } = decoded
  // authenticate with mal
  const client = popura(username, password)
  try {
    // update the anime
    await client.updateAnime(id, {episode, status})
    return callback(null, {statusCode: 200, body: returnBody(null, true, null)})
  } catch (err) {
    return callback(null, {statusCode: 500, body: returnBody('Something went wrong when updating anime status.', false)})
  }
}

import popura from 'popura'
import jwt from 'jsonwebtoken'

export async function handler (event, context, callback) {
  // parse body
  const { body = '' } = event
  const parsedBody = JSON.parse(body)
  const { username, password } = parsedBody
  const returnBody = (error, success, data = '') => JSON.stringify({
    error,
    success,
    data
  })

  if (!username || !password) return callback(null, {statusCode: 400, body: returnBody('Must specify username and password.', false)})

  const client = popura(username, password)
  try {
    const verified = await client.verifyAuth()
    // sign the username and password if success
    const signedToken = jwt.sign({
      username, password
    }, process.env.JWT_SECRET || 'THIS_SHOULD_NEVER_BE_THE_KEY_IN_PRODUCTION')
    // callback
    return callback(null, {
      statusCode: 200,
      body: returnBody(null, true, {
        username: verified.username,
        token: signedToken
      })
    })
  } catch (err) {
    return callback(null, {
      statusCode: 401,
      body: returnBody('User not found.', false)
    })
  }
}

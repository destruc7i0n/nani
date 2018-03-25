import axios from 'axios'

export async function handler (event, context, callback) {
  const { queryStringParameters: { name = null } = {} } = event
  const returnBody = (error, success, data = '') => JSON.stringify({
    error,
    success,
    data
  })
  // find the anime if it matches the exact name
  // or if there is only one, just return it as it should be close enough...
  const findAnime = (items, name) => items.find((item) => item.name.toLowerCase() === name.toLowerCase()) || items[0]

  if (!name) return callback(null, {statusCode: 400, body: returnBody('Invalid payload.', false)})

  const mal = await axios({
    method: 'GET',
    url: 'https://myanimelist.net/search/prefix.json',
    params: {
      type: 'anime',
      keyword: name,
      v: 1
    }
  })
  const { data = null } = mal

  if (!data) return callback(null, {statusCode: 500, body: returnBody('Something went wrong contacting MyAnimeList', false)})

  // grab the anime form the list
  const { categories: [ {items: anime = null} ] = [] } = data
  // check if there are options found
  if (anime && anime.length > 0) {
    const result = findAnime(anime, name)
    if (result) {
      return callback(null, {statusCode: 200, body: returnBody(null, true, result)})
    }
  }
  return callback(null, {statusCode: 404, body: returnBody(`Couldn't find any anime for "${name}".`, false)})
}

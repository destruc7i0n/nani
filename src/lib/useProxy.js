const CRUNCHYROLL_CDN = 'http://img1.ak.crunchyroll.com/'

export default (url) => {
  if (process.env.NODE_ENV === 'production') {
    return url.replace(CRUNCHYROLL_CDN, '/proxy/image/')
  }
  return url
}

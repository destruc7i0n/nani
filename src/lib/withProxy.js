const CRUNCHYROLL_CDN = 'https://img1.ak.crunchyroll.com/'
const CRUNCHYROLL_MANGA_CDN = 'https://api-manga.crunchyroll.com/'

const getCDN = (manga) => manga ? CRUNCHYROLL_MANGA_CDN : CRUNCHYROLL_CDN

export default (url, manga = false) => url.replace(
  getCDN(manga),
  `${process.env.NODE_ENV !== 'production' ? 'https://nani.ninja' : ''}/proxy/${manga ? 'manga/' : ''}image/`
)
export const replaceHttps = (url, manga = false) => url.replace(getCDN(manga), getCDN(manga).replace('http://', 'https://'))

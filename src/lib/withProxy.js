const CRUNCHYROLL_CDN = 'http://img1.ak.crunchyroll.com/'

export default (url) => url.replace(CRUNCHYROLL_CDN, `${process.env.NODE_ENV !== 'production' ? 'https://nani.ninja' : ''}/proxy/image/`)
export const replaceHttps = (url) => url.replace(CRUNCHYROLL_CDN, CRUNCHYROLL_CDN.replace('http://', 'https://'))

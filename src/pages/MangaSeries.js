import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getMangaChapterPages, getMangaChapters, getMangaSeries } from '../actions'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { Button } from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import request from 'request-promise'

import classNames from 'classnames'

import Loading from '../components/Loading/Loading'
import LoadingBox from '../components/Loading/LoadingBox'

import MangaDisclaimer from '../components/Manga/MangaDisclaimer'

class MangaSeries extends Component {
  constructor (props) {
    super(props)
    this.state = {
      chapters: [],
      pages: [],

      currentChapter: 0,
      currentPage: 0,
      currentPageData: {},

      b64: '',

      loading: true,
      loadingImage: false,
    }
  }

  async componentDidMount () {
    const { dispatch, match: { params: { id } }, } = this.props

    try {
      await dispatch(getMangaSeries(id))

      const { chapters } = await dispatch(getMangaChapters(id))

      this.setState({ loading: false, chapters, currentChapter: 0 })

      await this.getPages()
    } catch (e) {
      this.setState({ error: 'Something went wrong' })
    }
  }

  async componentDidUpdate (prevProps, prevState) {
    const { pages } = this.state

    if (prevState.currentPage !== this.state.currentPage) {
      let chapterIndex = this.state.currentPage
      const currentPage = pages[chapterIndex]

      this.setState({ currentPageData: currentPage })
      await this.loadImage(currentPage.url)
    }

    if (prevState.currentChapter !== this.state.currentChapter) {
      this.setState({ currentPage: 0 })
      await this.getPages()
    }
  }

  async getPages () {
    const { chapters, currentChapter } = this.state
    const { dispatch } = this.props

    const chapter = chapters[currentChapter]
    if (!chapter) return

    const { pages } = await dispatch(getMangaChapterPages(chapter.chapter_id))

    const pageDataRequests = pages.map(async (page) => {
      let url = null

      if (page.locale && page.locale.enUS && page.locale.enUS.encrypted_composed_image_url) {
        url = page.locale.enUS.encrypted_composed_image_url
      } else {
        url = page.image_url
      }

      return {
        number: page.number,
        is_spread: page.is_spread,
        url
      }
    })

    const pageData = await Promise.all(pageDataRequests)

    // load the first page
    await this.loadImage(pageData[0].url)

    this.setState({ pages: pageData })
  }

  async loadImage (url) {
    const decodeImage = (imageBuffer) => {
      for (let i = 0; i < imageBuffer.length; i++) {
        imageBuffer[i] ^= 0x42
      }
      return imageBuffer
    }

    const arrayBufferToBase64 = (buffer) => {
      let binary = ''
      const bytes = [].slice.call(new Uint8Array(buffer))

      bytes.forEach((b) => binary += String.fromCharCode(b))

      return window.btoa(binary)
    }

    this.setState({ loadingImage: true })

    const res = await request.get({ url: url, encoding: null })
    const decoded = decodeImage(res)
    const b64 = arrayBufferToBase64(decoded)

    this.setState({ b64, loadingImage: false })
  }

  updatePage (type = '+') {
    const { pages: { length: numPages }, currentPage } = this.state

    if ((type === '+' && currentPage + 1 <= numPages) || (type === '-' && currentPage - 1 >= 0)) {
      this.setState({
        currentPage: eval(`currentPage ${type} 1`) // he he
      })
    }
  }

  render () {
    const { loading, loadingImage, chapters, pages: { length: numPages }, b64, currentPage, currentChapter, currentPageData } = this.state
    const { series: allSeries, theme, match: { params: { id } } } = this.props

    const series = allSeries[id]

    const loadedDetails = !loading && series && series.locale

    const Navigation = ({ top }) => (
      <div className={classNames('col-12 row', { 'pb-3': top, 'pt-3': !top })}>
        <div className='col-2'>
          <Button color='success' block size='sm' disabled={currentPage === 0} onClick={() => this.updatePage('-')}>Prev Page</Button>
        </div>
        <div className='col-8'>
          <select className='w-100 h-100' value={currentChapter} onChange={({ target: { value } }) => this.setState({ currentChapter: value })}>
            {chapters.map((chapter, index) => (
              <option value={index}>{chapter.locale.enUS.name}</option>
            ))}
          </select>
        </div>
        <div className='col-2'>
          <Button color='success' block size='sm' disabled={currentPage === numPages - 1} onClick={() => this.updatePage('+')}>Next Page</Button>
        </div>
      </div>
    )

    return (
      <Fragment>
        <Helmet defer={false}>
          <title>{loadedDetails ? `${series.locale.enUS.name} Manga` : 'Manga'}</title>
        </Helmet>

        <MangaDisclaimer />

        {loadedDetails ? (
          <Fragment>
            <Link as='button' to='/manga' className='btn btn-link p-0 pb-2'>
              <FontAwesomeIcon icon='chevron-left' /> View all Manga
            </Link>
            <h3 className='border-bottom pb-3 mb-4'>
              <div className='d-flex justify-content-between'>
                {series.locale.enUS.name}
              </div>
            </h3>
            <div className='row justify-content-center'>
              <Navigation top />

              <div className={classNames({ 'col-md-8': !currentPageData.is_spread }, 'col-12')}>
                <div className='row h-100'>
                  <div className='col-12 h-100 w-100'>
                    {loadingImage ? <LoadingBox theme={theme} /> : <img src={`data:image/jpeg;base64,${b64}`} alt='' className='img-fluid' />}
                  </div>
                </div>
              </div>

              <Navigation />
            </div>
          </Fragment>
        ) : <Loading />}
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    series: store.Manga.series,
    theme: store.Options.theme
  }
})(MangaSeries)

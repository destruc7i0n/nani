import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getMangaChapterPages, getMangaChapters, getMangaSeries } from '../actions'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { push } from 'connected-react-router'

import { Button } from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import request from 'request-promise'

import classNames from 'classnames'

import api, { API_VERSION, DEVICE_TYPE } from '../lib/api_manga'

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

    this.trackChapterPage = this.trackChapterPage.bind(this)
  }

  async componentDidMount () {
    const { dispatch, match: { params: { id, chapter } }, } = this.props

    try {
      await dispatch(getMangaSeries(id))

      const { chapters } = await dispatch(getMangaChapters(id))

      // init the first chapter
      let currentChapter = 0
      if (chapter) {
        currentChapter = chapters.findIndex(({ chapter_id: chapterId }) => chapterId === chapter) || 0
      }

      let currentPage = 0
      if (chapters[currentChapter] && chapters[currentChapter].page_logs && chapters[currentChapter].page_logs.current_page) {
        currentPage = Number(chapters[currentChapter].page_logs.current_page) - 1
      }

      this.setState({ loading: false, chapters, currentChapter, currentPage })

      await this.getPages(currentPage)
    } catch (e) {
      this.setState({ error: 'Something went wrong' })
    }
  }

  async componentDidUpdate (prevProps, prevState) {
    const { chapters, pages } = this.state

    if (prevState.currentPage !== this.state.currentPage) {
      let chapterIndex = this.state.currentPage
      const currentPage = pages[chapterIndex]

      if (currentPage) {
        this.setState({ currentPageData: currentPage })
        await this.loadImage(currentPage.url)
        await this.trackChapterPage(currentPage.page_id)
      }
    }

    if (prevState.currentChapter !== this.state.currentChapter) {
      let currentChapter = chapters[this.state.currentChapter]

      let currentPage = 0
      if (currentChapter.page_logs && currentChapter.page_logs.current_page) {
        currentPage = Number(currentChapter.page_logs.current_page) - 1
      }

      this.setState({ currentPage })
      await this.getPages(currentPage)
    }
  }

  async getPages (currentPage) {
    const { chapters, currentChapter } = this.state
    const { dispatch } = this.props

    const chapter = chapters[currentChapter]
    if (!chapter) return

    // update url
    dispatch(push(`/manga/series/${chapter.series_id}/${chapter.chapter_id}`))

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
        page_id: page.page_id,
        url
      }
    })

    const pageData = await Promise.all(pageDataRequests)

    // load the first page
    await this.loadImage(pageData[currentPage].url)

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
        // eslint-disable-next-line no-eval
        currentPage: eval(`currentPage ${type} 1`) // he he
      })
    }
  }

  async trackChapterPage (pageId) {
    const { userId } = this.props

    const params = {
      user_id: userId,
      page_id: pageId,
      device_type: DEVICE_TYPE,
      api_ver: API_VERSION
    }

    await api({ route: 'log_chapterpage', params })
  }

  render () {
    const { loading, loadingImage, chapters, pages: { length: numPages }, b64, currentPage, currentChapter, currentPageData } = this.state
    const { series: allSeries, theme, match: { params: { id } } } = this.props

    const series = allSeries[id]

    const loadedDetails = !loading && series && series.locale

    const Navigation = ({ top }) => (
      <div className={classNames('col-12 row', { 'pb-3': top, 'pt-3': !top })}>
        <div className='col-2'>
          <Button color='success' block size='sm' disabled={currentPage === numPages - 1} onClick={() => this.updatePage('+')}>Next Page</Button>
        </div>
        <div className='col-8'>
          <select className='w-100 h-100' value={currentChapter} onChange={({ target: { value } }) => this.setState({ currentChapter: value })}>
            {chapters.map((chapter, index) => (
              // try to handle the names of the chapter to be informative...
              <option value={index}>
                {chapter.locale.enUS.name.toLowerCase().includes('chapter')
                  ? chapter.locale.enUS.name
                  : `Chapter ${Number(chapter.number)}: ${chapter.locale.enUS.name}`}
              </option>
            ))}
          </select>
        </div>
        <div className='col-2'>
          <Button color='success' block size='sm' disabled={currentPage === 0} onClick={() => this.updatePage('-')}>Prev Page</Button>
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

              {numPages
                ? <h4 className='col-12 d-flex justify-content-center pt-2'>
                    Page: {currentPage + 1}/{numPages}
                  </h4>
                : null}

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
    userId: store.Auth.user_id,
    series: store.Manga.series,
    theme: store.Options.theme
  }
})(MangaSeries)

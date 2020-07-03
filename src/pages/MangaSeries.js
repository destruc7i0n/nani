import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getMangaChapterPages, getMangaChapters, getMangaSeries } from '../actions'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { push } from 'connected-react-router'

import { Button } from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import classNames from 'classnames'

import api, { API_VERSION, DEVICE_TYPE } from '../lib/api_manga'

import Loading from '../components/Loading/Loading'

import MangaDisclaimer from '../components/Manga/MangaDisclaimer'

import './MangaSeries.css'

class MangaSeries extends Component {
  constructor (props) {
    super(props)
    this.state = {
      chapters: [],
      pages: [],

      currentChapter: 0,
      currentPage: 1,
      currentPageData: {},

      b64: '',

      loading: true,
      loadingImage: false,

      error: ''
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

      let currentPage = 1
      if (chapters[currentChapter] && chapters[currentChapter].page_logs && chapters[currentChapter].page_logs.current_page) {
        currentPage = Number(chapters[currentChapter].page_logs.current_page)
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
      let chapterIndex = this.state.currentPage - 1
      const currentPage = pages[chapterIndex]

      if (currentPage) {
        this.setState({ currentPageData: currentPage })
        await this.loadImage(currentPage.url)
        await this.trackChapterPage(currentPage.page_id)
      }
    }

    if (prevState.currentChapter !== this.state.currentChapter) {
      let currentChapter = chapters[this.state.currentChapter]

      let currentPage = 1
      if (currentChapter.page_logs && currentChapter.page_logs.current_page) {
        currentPage = Number(currentChapter.page_logs.current_page)
      }

      this.setState({ currentPage, b64: '' })
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
      let url

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

    // load the current page
    await this.loadImage(pageData[currentPage - 1].url)

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


    try {
      const res = await fetch(url)
      const buffer = await res.arrayBuffer()

      const decoded = decodeImage(new Uint8Array(buffer))
      const b64 = arrayBufferToBase64(decoded)

      this.setState({ b64, loadingImage: false })
    } catch (e) {
      this.setState({ error: 'Could not fetch page!' })
    }
  }

  updatePage (type = '+') {
    const { pages: { length: numPages }, currentPage, chapters, currentChapter } = this.state

    if ((type === '+' && currentPage < numPages) || (type === '-' && currentPage > 0)) {
      this.setState({
        // eslint-disable-next-line no-eval
        currentPage: eval(`currentPage ${type} 1`) // he he
      })
    } else if (currentPage === numPages) {
      const hasNextChapter = chapters.length && currentChapter + 1 < chapters.length

      if (hasNextChapter) {
        this.setState({ currentChapter: currentChapter + 1 })
      }
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
    const { loading, loadingImage, chapters, pages: { length: numPages }, b64, currentPage, currentChapter, currentPageData, error } = this.state
    const { series: allSeries, match: { params: { id } } } = this.props

    const series = allSeries[id]

    const loadedDetails = !loading && series && series.locale

    const isLastPage = currentPage === numPages
    const isFirstPage = currentPage === 1
    const hasNextChapter = chapters.length && currentChapter + 1 < chapters.length

    const Navigation = ({ top }) => (
      <div className={classNames('col-12 row', { 'pb-3': top, 'pt-3': !top })}>
        <div className='d-none d-sm-block col-sm-2'>
          <Button color='success' block size='sm' disabled={isFirstPage} onClick={() => this.updatePage('-')}>Prev</Button>
        </div>
        <div className='col-12 col-sm-8'>
          <select className='form-control w-100 h-100' value={currentChapter} onChange={({ target: { value } }) => this.setState({ currentChapter: value })}>
            {chapters.map((chapter, index) => (
              // try to handle the names of the chapter to be informative...
              <option value={index} key={`series-${index}`}>
                {chapter.locale.enUS.name.toLowerCase().includes('chapter')
                  ? chapter.locale.enUS.name
                  : `Chapter ${Number(chapter.number)}: ${chapter.locale.enUS.name}`}
              </option>
            ))}
          </select>
        </div>
        <div className='d-none d-sm-block col-sm-2'>
          <Button color='success' block size='sm' disabled={isLastPage} onClick={() => this.updatePage('+')}>Next</Button>
        </div>
      </div>
    )

    return (
      <Fragment>
        <Helmet defer={false}>
          <title>{loadedDetails ? `${series.locale.enUS.name} Manga` : 'Manga'}</title>
        </Helmet>

        <MangaDisclaimer />

        { <h1 className='col-sm-12 text-center text-danger'>{error}</h1> || null }

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
                    <div className='position-relative'>
                      {loadingImage && b64 ? <div className='position-absolute manga-loading-cover w-100 h-100'/> : null}
                      <img
                        src={`data:image/jpeg;base64,${b64}`} alt=''
                        className={classNames('img-fluid', { 'cursor-pointer': !isLastPage ? true : hasNextChapter })}
                        onClick={() => this.updatePage('+')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {numPages
                ? <div className='col-12 d-flex justify-content-center pt-2'>
                    <select
                      className='form-control w-auto'
                      value={currentPage}
                      onChange={({ target: { value } }) => this.setState({ currentPage: Number(value) })}
                    >
                    {[...Array(numPages)].map((index, value) => <option value={value + 1} key={`page-${value}`}>Page {value + 1}</option>)}
                  </select>
                </div>
                : null
              }

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

import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getHistory } from '../actions'
import { Helmet } from 'react-helmet'

import { Button } from 'reactstrap'

import Collection from '../components/Collections/Collection'
import Loading from '../components/Loading/Loading'

class History extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loaded: false,
      loadingMore: false
    }
    this.loadMore = this.loadMore.bind(this)
    this.scrollManager = this.scrollManager.bind(this)
  }

  async componentDidMount () {
    const { dispatch } = this.props
    try {
      await dispatch(getHistory())
      this.setState({ loaded: true })
    } catch (err) {
      console.error(err)
    }

    window.addEventListener('scroll', this.scrollManager, false)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.scrollManager, false)
  }

  scrollManager () {
    // at the bottom of the page and not currently loading anything
    if (
      ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) &&
      !this.state.loadingMore
    ) {
      this.loadMore()
    }
  }

  async loadMore () {
    const { dispatch } = this.props
    this.setState({ loadingMore: true })
    try {
      await dispatch(getHistory({}, true))
      this.setState({ loadingMore: false })
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const { loaded, loadingMore } = this.state
    const { history } = this.props
    const historyIds = history.map((item) => item.media.media_id)
    const loading = !loaded && historyIds.length === 0
    return (
      <Fragment>
        <Helmet defer={false}>
          <title>History</title>
        </Helmet>
        <Collection title='History' mediaIds={historyIds} loading={loading} loadingCardsCount={12} />
        { !loading
          ? !loadingMore
            ? <Button block onClick={() => this.loadMore()}>Load More...</Button>
            : <Loading size='2x' />
          : null }
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    history: store.Data.history.data
  }
})(History)

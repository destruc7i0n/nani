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
      loadingMore: false
    }
    this.loadMore = this.loadMore.bind(this)
  }

  async componentDidMount () {
    const { dispatch } = this.props
    try {
      await dispatch(getHistory())
    } catch (err) {
      console.error(err)
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
    const { loadingMore } = this.state
    const { history } = this.props
    const historyIds = history.map((item) => item.media.media_id)
    const loading = historyIds.length === 0
    return (
      <Fragment>
        <Helmet defer={false}>
          <title>History</title>
        </Helmet>
        <Collection title='History' mediaIds={historyIds} loading={loading} />
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

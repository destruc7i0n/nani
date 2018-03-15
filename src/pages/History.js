import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getHistory } from '../actions'
import { Helmet } from 'react-helmet'

import Collection from '../components/Collection'

class History extends Component {
  async componentWillMount () {
    const { dispatch } = this.props
    try {
      await dispatch(getHistory({ limit: 50 }))
    } catch (e) {
      console.error(e)
    }
  }

  render () {
    const { history } = this.props
    const historyIds = history.map((item) => item.media.media_id)
    return (
      <Fragment>
        <Helmet>
          <title>History - nani</title>
        </Helmet>
        <Collection title='History' mediaIds={historyIds} />
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    history: store.Data.history
  }
})(History)

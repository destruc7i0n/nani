import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getMediaForCollection } from '../actions'

import { Button } from 'reactstrap'

import Collection from './Collection'

class SeriesCollection extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loaded: props.index === 0
    }
    this.load = this.load.bind(this)
  }

  async componentDidMount () {
    const { index } = this.props
    if (index === 0) {
      await this.load()
    }
  }

  async load () {
    const { dispatch, id } = this.props
    await dispatch(getMediaForCollection(id))
    this.setState({ loaded: true })
  }

  render () {
    const { loaded } = this.state
    const { collectionMedia, id, perPage = 3, ...attr } = this.props
    return (
      <Fragment>
        <Collection
          mediaIds={loaded && collectionMedia[id] ? collectionMedia[id] : []}
          loading={loaded && !collectionMedia[id]}
          perPage={perPage} {...attr} />
        { !loaded && <Button className='mb-4' block onClick={this.load}>Load</Button> }
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    collectionMedia: store.Data.collectionMedia
  }
})(SeriesCollection)

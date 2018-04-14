import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getMediaForCollection } from '../actions'

import { Card, CardBody, CardFooter } from 'reactstrap'

import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faCaretUp from '@fortawesome/fontawesome-free-solid/faCaretUp'
import faCaretDown from '@fortawesome/fontawesome-free-solid/faCaretDown'

import Collection from './Collection'

class SeriesCollection extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loaded: false,
      expanded: props.index === 0
    }
    this.load = this.load.bind(this)
    this.toggleExpanded = this.toggleExpanded.bind(this)
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

  async toggleExpanded () {
    const { loaded, expanded } = this.state
    this.setState({ expanded: !expanded })
    // load if not loaded
    if (!loaded) {
      await this.load()
    }
  }

  render () {
    const { loaded, expanded } = this.state
    const { title, collectionMedia, id, perPage = 3 } = this.props
    return (
      <Card className='mt-4'>
        <CardBody style={{ cursor: 'pointer' }} onClick={this.toggleExpanded}>
          <div className='d-flex justify-content-between'>
            <h5>{title}</h5>
            <FontAwesomeIcon icon={expanded ? faCaretUp : faCaretDown} className='align-self-center ml-1' />
          </div>
        </CardBody>
        {
          expanded
            ? <CardFooter className='pt-4'>
              <Collection
                mediaIds={loaded && collectionMedia[id] ? collectionMedia[id] : []}
                loading={!loaded && !collectionMedia[id]}
                perPage={perPage}
                showTitle={false} />
            </CardFooter>
            : null
        }
      </Card>
    )
  }
}

export default connect((store) => {
  return {
    collectionMedia: store.Data.collectionMedia
  }
})(SeriesCollection)

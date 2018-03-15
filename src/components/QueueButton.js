import React, { Component } from 'react'
import { connect } from 'react-redux'
import { updateSeriesQueue } from '../actions'

import { Button } from 'reactstrap'

class QueueButton extends Component {
  constructor (props) {
    super(props)
    this.handle = this.handle.bind(this)
  }

  async handle () {
    const { dispatch, inQueue, id } = this.props
    await dispatch(updateSeriesQueue({ id, inQueue }))
  }

  render () {
    const { inQueue } = this.props
    return (
      <Button block color={inQueue ? 'danger' : 'success'} className='mt-2' onClick={this.handle}>
        {inQueue ? 'Remove from Queue' : 'Add to Queue'}
      </Button>
    )
  }
}

export default connect()(QueueButton)

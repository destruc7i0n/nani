import React, { Component } from 'react'

import classNames from 'classnames'

import { Alert } from 'reactstrap'

class PlayerContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: false
    }
  }

  static getDerivedStateFromError (error) {
    console.log(error)
    return { error: true }
  }

  componentDidCatch (error, errorInfo) {
    if (window.Sentry && process.env.NODE_ENV === 'production') {
      window.Sentry.captureException(error, { extra: errorInfo })
    }
  }

  render () {
    const { error } = this.state
    const { fullWidth = false } = this.props
    return (
      <div className={classNames('player-container', { 'theatre': fullWidth })}>
        {error && <Alert color='danger' className='align-items-center' toggle={() => this.setState({ error: false })}>
          Something went wrong!
        </Alert>}
        {this.props.children}
      </div>
    )
  }
}

export default PlayerContainer

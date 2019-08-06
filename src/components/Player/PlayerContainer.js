import React, { Component, Fragment } from 'react'

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
    return (
      <Fragment>
        {error && <Alert color='danger' className='align-items-center' toggle={() => this.setState({ error: false })}>
          Something went wrong!
        </Alert>}
        {this.props.children}
      </Fragment>
    )
  }
}

export default PlayerContainer

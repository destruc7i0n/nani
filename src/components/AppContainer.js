import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

import { cancelCurrentRequests } from '../lib/api'

class AppContainer extends Component {
  // stop requests when navigating
  componentDidUpdate (prevProps) {
    const {location: from} = prevProps
    const {location: to} = this.props
    // check if not to same page and not from login
    if (from && from.pathname !== to.pathname && from.pathname !== '/login') {
      cancelCurrentRequests()
    }
  }

  render () {
    const { children } = this.props
    return (
      <div>
        {children}
      </div>
    )
  }
}

export default withRouter(AppContainer)

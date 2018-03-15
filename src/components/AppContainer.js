import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import { Alert } from 'reactstrap'

import Header from './Header'
import Footer from './Footer'

import { cancelCurrentRequests } from '../lib/api'
import { setError } from '../actions'

class AppContainer extends Component {
  // stop requests when navigating
  componentDidUpdate (prevProps) {
    const {location: from} = prevProps
    const {location: to} = this.props
    // check if not to same page and not from some pages
    if (from && from.pathname !== to.pathname && !['/login'].includes(from.pathname)) {
      window.scrollTo(0, 0)
      cancelCurrentRequests()
    }
  }

  render () {
    const { dispatch, children, Auth, error } = this.props
    return (
      <div>
        <Helmet>
          <title>nani</title>
        </Helmet>
        { Auth.username && !Auth.expiredSession ? <Header /> : null }
        <main role='main' className='container'>
          { error ? <Alert color='danger' toggle={() => dispatch(setError(''))}>Uh oh! An error occurred... Check the console.</Alert> : null }
          { children }
          <Footer />
        </main>
      </div>
    )
  }
}

export default compose(
  withRouter,
  connect((store) => {
    return {
      Auth: store.Auth,
      error: store.Data.error
    }
  })
)(AppContainer)

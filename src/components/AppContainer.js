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
  componentDidMount () {
    const { history } = this.props
    this.unlisten = history.listen(() => cancelCurrentRequests())
  }

  componentWillUnmount () {
    this.unlisten()
  }

  // scroll to top
  componentDidUpdate (prevProps) {
    const {location: from} = prevProps
    const {location: to} = this.props
    // check if not to same page and not from some pages
    if (from && from.pathname !== to.pathname) {
      window.scrollTo(0, 0)
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

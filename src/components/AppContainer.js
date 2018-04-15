import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { setError, startSession } from '../actions'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { Alert, Button } from 'reactstrap'

import Header from './Header/Header'
import Footer from './Footer/Footer'
import Loading from './Loading/Loading'

import { cancelCurrentRequests } from '../lib/api'
import { isLoggedIn } from '../lib/auth'

class AppContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      initSession: false
    }
  }

  async componentDidMount () {
    const { dispatch, history } = this.props
    // cancel requests on chance
    this.unlisten = history.listen(() => cancelCurrentRequests())

    // init session
    try {
      await dispatch(startSession())
      this.setState({ initSession: true })
    } catch (e) {
      console.error(e)
    }
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

  reloadPage (e) {
    e.preventDefault()
    window.location.reload()
  }

  render () {
    const { initSession } = this.state
    const { dispatch, children, error } = this.props
    const loggedIn = isLoggedIn()
    return (
      <Fragment>
        <Helmet titleTemplate='%s - nani' />
        { loggedIn ? <Header /> : null }
        <main role='main' className='container'>
          { error
            ? <Alert color='danger' toggle={() => dispatch(setError(''))}>
              Uh oh! There was trouble contacting Crunchyroll. Try reloading the page or or try again later.
              {' '}
              <Button onClick={this.reloadPage}>Reload</Button>
            </Alert>
            : null }
          { initSession ? children : <Loading /> }
          { loggedIn ? <Footer /> : null }
        </main>
      </Fragment>
    )
  }
}

export default compose(
  withRouter,
  connect((store) => {
    return {
      error: store.Data.error
    }
  })
)(AppContainer)

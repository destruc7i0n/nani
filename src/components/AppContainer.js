import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { setError, setExpiredSession, startSession } from '../actions'
import { Helmet } from 'react-helmet'
import { matchPath } from 'react-router'
import { withRouter } from 'react-router-dom'

import { Alert, Button } from 'reactstrap'
import classNames from 'classnames'

import Header from './Header/Header'
import Footer from './Footer/Footer'
import Loading from './Loading/Loading'
import AboutAlert from './Alerts/AboutAlert'

import { cancelCurrentRequests } from '../lib/api'

const isMediaPage = (url) => matchPath(url, { path: '/series/:id/:media', exact: true })

class AppContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      initSession: false
    }
  }

  async componentDidMount () {
    const { dispatch, history } = this.props
    // cancel requests on page change
    this.unlisten = history.listen(() => {
      // do not cancel media page requests
      if (!isMediaPage(this.props.location.pathname)) cancelCurrentRequests()
    })

    // init session
    try {
      // always start a new session on page load
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
    const {dispatch, Auth, location: to} = this.props

    // check if not to same page and not from some pages
    if (from && from.pathname !== to.pathname && !isMediaPage(from.pathname)) {
      window.scrollTo(0, 0)
    }

    if (Auth.expires && new Date() > new Date(Auth.expires)) {
      dispatch(setExpiredSession(Auth.username))
    }
  }

  reloadPage (e) {
    e.preventDefault()
    window.location.reload()
  }

  render () {
    const { initSession } = this.state
    const { dispatch, theme, children, error, location: { pathname } } = this.props

    const isLoginPage = matchPath(pathname, { path: '/login', exact: true })
    const isSeriesPage = matchPath(pathname, { path: '/series/:id', exact: true })

    const noHeader = isLoginPage
    const noContainerLayout = isSeriesPage
    const noAlerts = isSeriesPage
    const noFooter = !!isLoginPage

    const layout = (
      <>
        <main role='main' className={classNames({ 'container': !noContainerLayout })}>
          { error && !isSeriesPage
            ? <Alert color='danger' className='d-flex align-items-center' toggle={() => dispatch(setError(''))}>
              {{
                'true': (
                  <>
                    Uh oh! There was trouble contacting Crunchyroll. Try reloading the page or try again later.
                    <Button onClick={this.reloadPage} size='sm' className='ml-auto'>Reload</Button>
                  </>
                ),
                'bad_request': (
                  <>
                    Your session with Crunchyroll has ended. Please login.
                  </>
                )
              }[(error || true).toString()]}
            </Alert>
            : null }
          { !noAlerts ? <AboutAlert /> : null }
          { initSession ? children : <Loading /> }
        </main>
        { !noFooter ? <Footer /> : null }
      </>
    )

    return (
      <>
        <Helmet titleTemplate='%s - nani'>
          <body className={theme} />
        </Helmet>
        { !noHeader ? <Header /> : null }
        { layout }
      </>
    )
  }
}

export default compose(
  withRouter,
  connect((store) => {
    return {
      theme: store.Options.theme,
      error: store.Data.error,
      Auth: store.Auth
    }
  })
)(AppContainer)

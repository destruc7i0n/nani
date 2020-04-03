import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { setError, setExpiredSession, startSession } from '../actions'
import { Helmet } from 'react-helmet'
import { matchPath } from 'react-router'
import { withRouter, Link } from 'react-router-dom'

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
    const { dispatch, Auth, history } = this.props
    // cancel requests on page change
    this.unlisten = history.listen(() => {
      // do not cancel media page requests
      if (!isMediaPage(this.props.location.pathname)) cancelCurrentRequests()
    })

    // init session
    try {
      // only request a new session if new session or expires
      if (!Auth.session_id || (Auth.session_id && Auth.expires && new Date() > new Date(Auth.expires)) || (!Auth.guest && !Auth.user_id)) {
        await dispatch(startSession())
      }
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
    const { dispatch, Auth, theme, showPremiumAlert, children, error, location: { pathname } } = this.props

    const isLoginPage = matchPath(pathname, { path: '/login', exact: true })
    const isSeriesPage = matchPath(pathname, { path: '/series/:id', exact: true })

    const noHeader = isLoginPage
    const noContainerLayout = isSeriesPage
    const noAlerts = isSeriesPage || isLoginPage
    const noFooter = isLoginPage

    const layout = (
      <>
        <main role='main' className={classNames({ 'container': !noContainerLayout })}>
          { error && !isSeriesPage
            ? <Alert color='danger' className='d-flex align-items-center' toggle={() => dispatch(setError(''))}>
              {{
                'true': (
                  <Fragment>
                    Uh oh! There was trouble contacting Crunchyroll. Try reloading the page or try again later.
                    <Button onClick={this.reloadPage} size='sm' className='ml-auto'>Reload</Button>
                  </Fragment>
                ),
                'bad_request': (
                  <Fragment>
                    Your session with Crunchyroll has ended. Please login.
                  </Fragment>
                )
              }[(error || true).toString()]}
            </Alert>
            : null }
          { !noAlerts ? <AboutAlert /> : null }
          { !Auth.premium && !noAlerts && showPremiumAlert
            ? <Alert color='info' className='d-flex align-items-center'>
              You are not logged in to a Crunchyroll Premium account! Please login to enjoy all of the library that Crunchyroll has to offer.
              <Button
                size='sm'
                color='primary'
                className='ml-auto'
                tag={Link}
                to={{pathname: '/login', state: { prevPath: pathname }}}
              >Login</Button>
            </Alert>
            : null}
          { initSession ? children : <Loading /> }
        </main>
        { !noFooter ? <Footer /> : null }
      </>
    )

    return (
      <Fragment>
        <Helmet titleTemplate='%s - nani'>
          <body className={theme} />
        </Helmet>
        { !noHeader ? <Header /> : null }
        { layout }
      </Fragment>
    )
  }
}

export default compose(
  withRouter,
  connect((store) => {
    return {
      showPremiumAlert: store.Options.showPremiumAlert,
      theme: store.Options.theme,
      error: store.Data.error,
      Auth: store.Auth
    }
  })
)(AppContainer)

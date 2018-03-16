import React, { Component } from 'react'
import { BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { logout, startSession } from './actions'

import { isLoggedIn } from './lib/auth'

import AppContainer from './components/AppContainer'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AuthedRoute from './components/AuthedRoute'
import Series from './pages/Series'
import Media from './pages/Media'
import Queue from './pages/Queue'
import History from './pages/History'

import 'bootstrap/dist/css/bootstrap.css'

class App extends Component {
  async componentWillMount () {
    const { dispatch, Auth } = this.props
    try {
      await dispatch(startSession())
    } catch (e) {
      console.error(e)
    }
    if (
      (Object.keys(Auth).length > 0) &&
      (!Auth.token || !Auth.expires || new Date() > new Date(Auth.expires))
    ) {
      await dispatch(logout(true))
    }
  }

  render () {
    return (
      <Router>
        <AppContainer>
          <Switch>
            <AuthedRoute exact path='/' authed={isLoggedIn()} component={Dashboard} />
            <AuthedRoute exact path='/login' redirect='/' authed={!isLoggedIn()} component={Login} />
            <AuthedRoute path='/queue' authed={isLoggedIn()} component={Queue} />
            <AuthedRoute path='/history' authed={isLoggedIn()} component={History} />
            <AuthedRoute path='/series/:id/:media' authed={isLoggedIn()} component={Media} />
            <AuthedRoute path='/series/:id' authed={isLoggedIn()} component={Series} />
            <Redirect from='*' to='/login' />
          </Switch>
        </AppContainer>
      </Router>
    )
  }
}

export default connect((store) => {
  return {
    Auth: store.Auth
  }
})(App)

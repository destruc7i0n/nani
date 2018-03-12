import React, { Component } from 'react'
import { BrowserRouter as Router, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import { startSession } from './actions'

import { isLoggedIn } from './lib/auth'

import AppContainer from './components/AppContainer'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AuthedRoute from './components/AuthedRoute'
import Series from './pages/Series'
import Media from './pages/Media'

class App extends Component {
  async componentWillMount () {
    console.log('will')
    const { dispatch } = this.props
    try {
      await dispatch(startSession())
    } catch (e) {
      console.error(e)
    }
  }

  render () {
    return (
      <Router>
        <AppContainer>
          <Switch>
            <AuthedRoute exact path='/' authed={isLoggedIn()} component={Dashboard} />
            <AuthedRoute exact path='/login' redirect='/' authed={!isLoggedIn()} component={Login} />
            <AuthedRoute path='/series/:id/:media' authed={isLoggedIn()} component={Media} />
            <AuthedRoute path='/series/:id' authed={isLoggedIn()} component={Series} />
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

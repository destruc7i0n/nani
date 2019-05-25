import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { logout } from './actions'
import { Switch, Redirect, Route, withRouter } from 'react-router-dom'

import { isLoggedIn } from './lib/auth'

import AppContainer from './components/AppContainer'
import Loading from './components/Loading/Loading'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AuthedRoute from './components/AuthedRoute'
import Series from './pages/Series'
import Media from './pages/Media'
import Queue from './pages/Queue'
import History from './pages/History'
import Recent from './pages/Recent'
import SeriesList from './pages/SeriesList'
import Categories from './pages/Categories'
import MangaList from './pages/MangaList'
import MangaSeries from './pages/MangaSeries'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faTv } from '@fortawesome/free-solid-svg-icons/faTv'
import { faClock } from '@fortawesome/free-solid-svg-icons/faClock'
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch'
import { faListOl } from '@fortawesome/free-solid-svg-icons/faListOl'
import { faFastForward } from '@fortawesome/free-solid-svg-icons/faFastForward'
import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight'
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons/faCaretLeft'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'
import { faStar } from '@fortawesome/free-solid-svg-icons/faStar'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle'
import { faCertificate } from '@fortawesome/free-solid-svg-icons/faCertificate'
import { faClosedCaptioning } from '@fortawesome/free-solid-svg-icons/faClosedCaptioning'
import { faHistory } from '@fortawesome/free-solid-svg-icons/faHistory'
import { faList } from '@fortawesome/free-solid-svg-icons/faList'
import { faStepForward } from '@fortawesome/free-solid-svg-icons/faStepForward'
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons/faCalendarAlt'
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus'
import { faInfo } from '@fortawesome/free-solid-svg-icons/faInfo'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons/faCircleNotch'
import { faCrown } from '@fortawesome/free-solid-svg-icons/faCrown'
import { faBook } from '@fortawesome/free-solid-svg-icons/faBook'

import './App.css'
import './themes/light.scss'
import './themes/dark.scss'

library.add(
  faTv,
  faClock,
  faSearch,
  faListOl,
  faFastForward,
  faCaretRight,
  faCaretLeft,
  faChevronRight,
  faChevronLeft,
  faCaretDown,
  faExclamationTriangle,
  faStar,
  faCheckCircle,
  faTimesCircle,
  faCertificate,
  faClosedCaptioning,
  faHistory,
  faList,
  faStepForward,
  faUser,
  faCalendarAlt,
  faCog,
  faPlus,
  faMinus,
  faInfo,
  faCircleNotch,
  faCrown,
  faBook,
)

class App extends Component {
  async componentDidMount () {
    // ensure logged in
    const { dispatch, Auth } = this.props
    if (
      (Object.keys(Auth).length > 0) &&
      !Auth.guest &&
      (!Auth.token || !Auth.expires || new Date() > new Date(Auth.expires))
    ) {
      await dispatch(logout(true))
    }
    if (Auth.guest && Auth.username) {
      await dispatch(logout(true))
    }
  }

  render () {
    const { Auth } = this.props

    return (
      <AppContainer>
        <Switch>
          <Route exact path='/' component={Dashboard} />
          <AuthedRoute exact path='/login' redirect='/' authed={!isLoggedIn()} component={Login} />
          <AuthedRoute path='/queue' authed={isLoggedIn()} component={Queue} />
          <AuthedRoute path='/history' authed={isLoggedIn()} component={History} />
          <Route path='/recent' component={Recent} />
          <Route path='/series/:id/:media' component={Media} />
          <Route path='/series/:id' component={Series} />
          <Route path='/list/:type' component={(props) => <SeriesList type={props.match.params.type} {...props} />} />
          <Route path='/categories' component={Categories} />
          <AuthedRoute path='/manga/series/:id/:chapter?' authed={isLoggedIn() && Auth.premium} component={MangaSeries} />
          <AuthedRoute path='/manga' authed={isLoggedIn() && Auth.premium} component={MangaList} />
          <Route path='/empty' component={() => <Loading />} />
          <Redirect from='*' to='/' />
        </Switch>
      </AppContainer>
    )
  }
}

export default compose(
  withRouter,
  connect((store) => {
    return {
      Auth: store.Auth
    }
  })
)(App)

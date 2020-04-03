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
import {
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
  faStepBackward,
  faUser,
  faCalendarAlt,
  faCog,
  faPlus,
  faMinus,
  faInfo,
  faCircleNotch,
  faCrown,
  faBook,
  faPlay,
  faPause,
  faCompress,
  faExpand,
  faQuestion,
  faVolumeUp,
  faVolumeDown,
  faVolumeMute,
  faVolumeOff,
  faClone,
  faArrowLeft,
  faVideo,
  faDesktop,
} from '@fortawesome/free-solid-svg-icons'

import './App.scss'
import './themes/light.scss'
import './themes/dark.scss'

// you don't see anything
const faVolume = {
  prefix: 'fas',
  iconName: 'volume',
  icon: [480, 512, [], 'f028', 'M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zM480 256c0-63.53-32.06-121.94-85.77-156.24-11.19-7.14-26.03-3.82-33.12 7.46s-3.78 26.21 7.41 33.36C408.27 165.97 432 209.11 432 256s-23.73 90.03-63.48 115.42c-11.19 7.14-14.5 22.07-7.41 33.36 6.51 10.36 21.12 15.14 33.12 7.46C447.94 377.94 480 319.53 480 256zm-141.77-76.87c-11.58-6.33-26.19-2.16-32.61 9.45-6.39 11.61-2.16 26.2 9.45 32.61C327.98 228.28 336 241.63 336 256c0 14.38-8.02 27.72-20.92 34.81-11.61 6.41-15.84 21-9.45 32.61 6.43 11.66 21.05 15.8 32.61 9.45 28.23-15.55 45.77-45 45.77-76.88s-17.54-61.32-45.78-76.86z']
}

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
  faStepBackward,
  faUser,
  faCalendarAlt,
  faCog,
  faPlus,
  faMinus,
  faInfo,
  faCircleNotch,
  faCrown,
  faBook,
  faPlay,
  faPause,
  faCompress,
  faExpand,
  faQuestion,
  faVolumeUp,
  faVolumeMute,
  faVolumeDown,
  faVolumeOff,
  faVolume,
  faClone,
  faArrowLeft,
  faVideo,
  faDesktop,
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

import React from 'react'
import { Redirect, Route } from 'react-router-dom'

const AuthedRoute = ({component: Component, authed, redirect = '/login', ...attr}) => {
  return (
    <Route
      {...attr}
      render={(props) => authed
        ? <Component {...props} />
        : <Redirect to={redirect} />}
    />
  )
}

export default AuthedRoute

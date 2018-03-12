import React from 'react'
import { Redirect, Route } from 'react-router-dom'

const AuthedRoute = ({component: Component, authed, redirect = '/login', ...rest}) => {
  return (
    <Route
      {...rest}
      render={(props) => authed
        ? <Component {...props} />
        : <Redirect to={{pathname: redirect, state: {from: props.location}}} />}
    />
  )
}

export default AuthedRoute

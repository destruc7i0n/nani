import React, { Component } from 'react'
import { connect } from 'react-redux'
import { login } from '../actions'

class Login extends Component {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      error: ''
    }
    this.handleLogin = this.handleLogin.bind(this)
  }

  async handleLogin (e) {
    const { username, password } = this.state
    const { dispatch, history, location } = this.props
    e.preventDefault()
    try {
      await dispatch(login(username, password))
      history.push(location.state.from || '/')
    } catch (err) {
      console.error(err)
      this.setState({ error: err.data.message })
    }
  }

  render () {
    const { error } = this.state
    return (
      <div>
        {error || null}
        <form onSubmit={this.handleLogin}>
          <p>
            Username:{' '}
            <input
              type='text'
              name='username'
              required
              onChange={({ target: { value: username } }) => this.setState({ username })} />
          </p>
          <p>
            Password:{' '}
            <input
              type='password'
              name='password'
              required
              onChange={({ target: { value: password } }) => this.setState({ password })} />
          </p>
          <button type='submit'>Login</button>
        </form>
      </div>
    )
  }
}

export default connect((store) => {
  return {
    Auth: store.Auth
  }
})(Login)

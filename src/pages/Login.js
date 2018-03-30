import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { login } from '../actions'

import { Card } from 'reactstrap'

import Footer from '../components/Footer'

import icon from '../assets/ninja-blue.png'

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
    const { dispatch, history } = this.props
    e.preventDefault()
    try {
      await dispatch(login(username, password))
      history.push('/')
    } catch (err) {
      console.error(err)
      this.setState({ error: err.data.message })
    }
  }

  render () {
    const { error } = this.state
    const { expiredSession } = this.props
    return (
      <div className='text-center'>
        <Helmet>
          <title>Login - nani</title>
          {/* language=CSS */}
          <style>{`
            body {
              margin-top: 10vh;
              display: -ms-flexbox;
              display: -webkit-box;
              display: flex;
              -ms-flex-align: center;
              -ms-flex-pack: center;
              -webkit-box-align: center;
              align-items: center;
              -webkit-box-pack: center;
              justify-content: center;
              padding-top: 40px;
              padding-bottom: 40px;
            }
            .form-signin {
              width: 100%;
              max-width: 330px;
              padding: 15px;
              margin: 0 auto;
            }
            .form-signin .form-control {
              position: relative;
              box-sizing: border-box;
              height: auto;
              padding: 10px;
              font-size: 16px;
            }
            .form-signin .form-control:focus {
              z-index: 2;
            }
            .form-signin input[type="text"] {
              margin-bottom: -1px;
              border-bottom-right-radius: 0;
              border-bottom-left-radius: 0;
            }
            .form-signin input[type="password"] {
              margin-bottom: 10px;
              border-top-left-radius: 0;
              border-top-right-radius: 0;
            }
          `}</style>
        </Helmet>
        <form className='form-signin' onSubmit={this.handleLogin}>
          <img src={icon} className='img-fluid' alt='nani?!' style={{ maxWidth: '100px' }} />
          <h1 className='h3 mb-1 font-weight-normal'>nani?!</h1>
          <p className='font-italic font-weight-light'>What's Crunchyroll?</p>
          {error ? <p className='text-danger'>{error}</p> : null}
          {expiredSession ? <p className='text-danger'>Your session expired.</p> : null}
          <label htmlFor='inputUsername' className='sr-only'>Username</label>
          <input
            type='text'
            id='inputUsername'
            className='form-control'
            placeholder='Username'
            required
            autoFocus
            onChange={({ target: { value: username } }) => this.setState({ username })} />
          <label htmlFor='inputPassword' className='sr-only'>Password</label>
          <input
            type='password'
            id='inputPassword'
            className='form-control'
            placeholder='Password'
            required
            onChange={({ target: { value: password } }) => this.setState({ password })} />
          <button className='btn btn-lg btn-primary btn-block' type='submit'>Sign in</button>
          <Card body className='bg-light mt-2'>
            Your password is sent directly to Crunchyroll, and is never stored.
            <hr />
            This site is not endorsed by or affiliated with Crunchyroll.
          </Card>
          <Footer />
        </form>
      </div>
    )
  }
}

export default connect((store) => {
  return {
    Auth: store.Auth,
    expiredSession: store.Auth.expiredSession
  }
})(Login)

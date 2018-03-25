import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { loginMal, removeMal } from '../actions'

import { Button, Modal, ModalHeader, ModalBody, Form, FormGroup, Col, Label, Input, Alert } from 'reactstrap'

import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/fontawesome-free-solid'

class Options extends Component {
  constructor (props) {
    super(props)
    this.state = {
      open: false,
      error: '',
      mal: {
        username: '',
        password: ''
      }
    }

    this.toggle = this.toggle.bind(this)
    this.authMal = this.authMal.bind(this)
  }

  toggle () {
    this.setState({
      open: !this.state.open
    })
  }

  async authMal (e) {
    // don't do any submission
    e.preventDefault()
    const { mal: { username, password } } = this.state
    const { dispatch } = this.props
    try {
      await dispatch(loginMal(username, password))
      this.setState({ error: '' })
    } catch (err) {
      console.error(err)
      this.setState({ error: (err.response && err.response.data && err.response.data.error) || 'Something went wrong.' })
    }
  }

  render () {
    const { open, mal, error } = this.state
    const { mal: malAuth, dispatch } = this.props
    const loggedIn = malAuth.username && malAuth.token
    return (
      <Fragment>
        <Button onClick={this.toggle} className='w-100'>
          <FontAwesomeIcon icon={faCog} />
        </Button>
        <Modal isOpen={open} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Options</ModalHeader>
          <ModalBody>
            {error && <Alert color='danger'>{error}</Alert>}
            <h4 className='border-bottom pb-2 mb-3'>MyAnimeList</h4>
            {
              !loggedIn
                ? (
                  <Form onSubmit={this.authMal}>
                    <FormGroup>
                      <small className='text-center'>
                        If you choose to login, on each anime you're watching that is available on MyAnimeList,
                        there will be a button that will allow you to update the episode you're watching on MyAnimeList.
                      </small>
                      <br />
                      <small className='text-danger'>
                        Note, this does not know if you've watched an episode already.
                        <br />
                        This feature is not 100% perfect, but works most of the time...
                      </small>
                    </FormGroup>
                    <FormGroup row>
                      <Label for='username' sm={2}>Username</Label>
                      <Col sm={10}>
                        <Input
                          required
                          type='text'
                          name='username'
                          id='username'
                          placeholder='Username'
                          value={mal.username}
                          onChange={({ target: { value } }) => this.setState({ mal: { ...mal, username: value } })}
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Label for='password' sm={2}>Password</Label>
                      <Col sm={10}>
                        <Input
                          required
                          type='password'
                          name='password'
                          id='password'
                          placeholder='Password'
                          value={mal.password}
                          onChange={({ target: { value } }) => this.setState({ mal: { ...mal, password: value } })}
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup>
                      <Button color='success' block>Login</Button>
                    </FormGroup>
                  </Form>
                )
                : (
                  <div className='d-flex justify-content-between'>
                    Logged In ({malAuth.username})
                    <Button onClick={() => dispatch(removeMal())}>Logout</Button>
                  </div>
                )
            }
          </ModalBody>
        </Modal>
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    mal: store.Auth.mal
  }
})(Options)

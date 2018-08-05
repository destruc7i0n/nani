import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { checkAniListToken, loginMal, removeAniList, removeMal } from '../../actions'

import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Col,
  Label,
  Input,
  Alert,
  Card,
  CardBody,
  CardTitle
} from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class Options extends Component {
  constructor (props) {
    super(props)
    this.state = {
      open: false,
      error: '',
      mal: {
        username: '',
        password: ''
      },
      anilist: {
        token: ''
      }
    }

    this.toggle = this.toggle.bind(this)
    this.authMal = this.authMal.bind(this)
    this.authAniList = this.authAniList.bind(this)
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
      this.setState({ error: '', mal: { username: '', password: '' } })
    } catch (err) {
      console.error(err)
      this.setState({ error: (err.response && err.response.data && err.response.data.error) || 'Something went wrong.' })
    }
  }

  async authAniList (e) {
    // don't submit!
    e.preventDefault()
    const { anilist: { token } } = this.state
    const { dispatch } = this.props
    try {
      await dispatch(checkAniListToken(token))
      this.setState({ error: '', anilist: { token: '' } })
    } catch (err) {
      console.error(err)
      this.setState({ error: (err.response && err.response.data && err.response.data.error) || 'Something went wrong.' })
    }
  }

  render () {
    const { open, mal, anilist, error } = this.state
    const { mal: malAuth, anilist: anilistAuth, dispatch } = this.props
    const loggedInMal = malAuth.username && malAuth.token
    const loggedInAniList = anilistAuth.username && anilistAuth.token
    return (
      <Fragment>
        <Button onClick={this.toggle} className='w-100'>
          <FontAwesomeIcon icon='cog' />
        </Button>
        <Modal isOpen={open} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Options</ModalHeader>
          <ModalBody>
            {error && <Alert color='danger'>{error}</Alert>}
            <Card className='mb-3'>
              <CardBody>
                <CardTitle>Info</CardTitle>
                <small className='text-center'>
                  If you choose to login, on each anime you're watching that is available on each service,
                  there will be a button that will allow you to update the episode you're watching on the service of choice.
                  <br />
                  Your login will only be used for authentication with AniList/MyAnimeList. It will not be stored on any server.
                </small>
                <br />
                <small className='text-danger'>
                  Note, the MyAnimeList integration does not know if you've watched an episode already.
                  <br />
                  This feature is not 100% perfect (it may choose the wrong show), but works most of the time... Click the "View" button next to the update button to ensure that you're updating the correct series!
                </small>
              </CardBody>
            </Card>
            <h4 className='border-bottom pb-2 mb-3'>AniList</h4>
            {
              !loggedInAniList
                ? (
                  <Form onSubmit={this.authAniList}>
                    <FormGroup row>
                      <div className='col-8'>
                        Click the the button on the right to login with AniList. Copy the token you get into the field below and click "Save".
                      </div>
                      <div className='col-4 d-flex align-items-center'>
                        <Button
                          color='info'
                          block
                          href='https://anilist.co/api/v2/oauth/authorize?client_id=470&response_type=token'
                          target='_blank'
                          rel='noopener noreferrer'
                        >Login</Button>
                      </div>
                    </FormGroup>
                    <FormGroup row>
                      <Label for='token' sm={2}>Token</Label>
                      <Col sm={10}>
                        <Input
                          required
                          type='text'
                          name='token'
                          id='token'
                          placeholder='Token'
                          value={anilist.token}
                          onChange={({ target: { value } }) => this.setState({ anilist: { ...anilist, token: value } })}
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup>
                      <Button type='submit' color='success' block>Save</Button>
                    </FormGroup>
                  </Form>
                )
                : (
                  <div className='d-flex justify-content-between'>
                    Logged In ({anilistAuth.username})
                    <Button onClick={() => dispatch(removeAniList())}>Logout</Button>
                  </div>
                )
            }
            <h4 className='border-bottom pb-2 mb-3'>MyAnimeList</h4>
            <Alert color='warning'>Currently broken due to MAL shutting down their API.</Alert>
            {
              !loggedInMal
                ? (
                  <Form onSubmit={this.authMal}>
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
    mal: store.Auth.mal,
    anilist: store.Auth.anilist
  }
})(Options)

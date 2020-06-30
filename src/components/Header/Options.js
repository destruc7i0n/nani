import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import {
  checkAniListToken,
  getLanguages,
  loginMal,
  removeAniList,
  removeMal,
  setHomepageContinueCount,
  setLanguage,
  setTheme,
  toggleAutoplay,
  toggleAutoTheme,
  toggleOrderControls,
  togglePremiumAlert
} from '../../actions'

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

import './Options.scss'

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
    this.listenForColourTheme = this.listenForColourTheme.bind(this)
  }

  componentDidMount () {
    const { dispatch } = this.props
    dispatch(getLanguages())

    this.listenForColourTheme()
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

  listenForColourTheme () {
    const { dispatch, autoTheme } = this.props

    const themeSet = (theme) => dispatch(setTheme(theme))

    // if either is supported, set to initial and listen
    const dark = window.matchMedia('(prefers-color-scheme: dark)')
    const light = window.matchMedia('(prefers-color-scheme: light)')
    if ((dark.matches || light.matches) && autoTheme) {
      themeSet(light.matches ? 'light' : 'dark')
      light.addListener((e) => {
        this.props.autoTheme && themeSet(e.matches ? 'light' : 'dark')
      })
    }
  }

  render () {
    const { open, mal, anilist, error } = this.state
    const { mal: malAuth, anilist: anilistAuth, language, languages, autoplay, orderControls, theme, autoTheme, continueCount, showPremiumAlert, dispatch } = this.props
    const loggedInMal = malAuth.username && malAuth.token
    const loggedInAniList = anilistAuth.username && anilistAuth.token
    return (
      <Fragment>
        <Button onClick={this.toggle} className='w-100'>
          <FontAwesomeIcon icon='cog' />
        </Button>
        <Modal className='options-modal' isOpen={open} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Options</ModalHeader>
          <ModalBody>
            <h3>Preferences</h3>
            <div className='preferences row'>
              <Label for='theme' sm={6}>Theme</Label>
              <div className='col-sm-6 d-flex align-items-center'>
                <select className='custom-select' id='theme' value={theme} onChange={({ target: { value } }) => dispatch(setTheme(value))}>
                  <option value='light'>Light</option>
                  <option value='dark'>Dark</option>
                </select>
              </div>
            </div>
            <div className='row'>
              <Label for='autoTheme' sm={6}>
                Automatically change theme?
              </Label>
              <div className='col-sm-6 d-flex align-items-center'>
                <input type='checkbox' id='autoTheme' checked={autoTheme} onChange={() => dispatch(toggleAutoTheme())} />
              </div>
              <small className='col pb-2 option-info'>Based on computer colour theme, if possible.</small>
            </div>
            <div className='row'>
              <Label for='language' sm={6}>Content Language</Label>
              <div className='col-sm-6 d-flex align-items-center'>
                <select className='custom-select' id='language' value={language} onChange={({ target: { value } }) => dispatch(setLanguage(value))}>
                  {languages.map((language) => <option value={language.id} key={`language-${language.id}`}>{language.text}</option>)}
                </select>
              </div>
            </div>
            <div className='row'>
              <Label for='autoplay' sm={6}>Autoplay video?</Label>
              <div className='col-sm-6 d-flex align-items-center'>
                <input type='checkbox' id='autoplay' checked={autoplay} onChange={() => dispatch(toggleAutoplay())} />
              </div>
            </div>
            <div className='row'>
              <Label for='orderControls' sm={6}>Show episode order controls?</Label>
              <div className='col-sm-6 d-flex align-items-center'>
                <input type='checkbox' id='orderControls' checked={orderControls} onChange={() => dispatch(toggleOrderControls())} />
              </div>
            </div>
            <div className='row'>
              <Label for='continueCardCount' sm={10}>Dashboard "Continue Watching" episode card count:</Label>
              <div className='col-sm-2 d-flex align-items-center justify-content-end'>
                <select onChange={({ target: { value } }) => dispatch(setHomepageContinueCount(value))} value={continueCount}>
                  <option value={4}>4</option>
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={16}>16</option>
                </select>
              </div>
            </div>
            <div className='row'>
              <Label for='showPremiumAlert' sm={6}>Show premium account alert?</Label>
              <div className='col-sm-6 d-flex align-items-center'>
                <input type='checkbox' id='showPremiumAlert' checked={showPremiumAlert} onChange={() => dispatch(togglePremiumAlert())} />
              </div>
              <small className='col pb-2 option-info'>Shown when not logged in with a Crunchyroll premium account.</small>
            </div>

            <br/>

            <h3>Integrations</h3>
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
    orderControls: store.Options.orderControls,
    autoplay: store.Options.autoplay,
    language: store.Options.language,
    theme: store.Options.theme,
    autoTheme: store.Options.autoThemeChange,
    continueCount: store.Options.homepageContinueCount,
    showPremiumAlert: store.Options.showPremiumAlert,
    languages: store.Data.languages,
    mal: store.Auth.mal,
    anilist: store.Auth.anilist
  }
})(Options)

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { hideAbout } from '../../actions'

import { Alert } from 'reactstrap'

class AboutAlert extends Component {
  render () {
    const { dispatch, visible } = this.props
    return (
      <Alert color='info' isOpen={visible} toggle={() => dispatch(hideAbout())}>
        <h5 className='alert-heading'>What is nani?</h5>
        <p className='mb-0'>
          nani is an unofficial client for Crunchyroll. It provides an interface for Crunchyroll that is fast and easy to use, all while providing handy features, such as AniList updating.

          <br /><br />

          It is 100%{' '}
          <a href='https://github.com/destruc7i0n/nani' target='_blank' rel='noopener noreferrer'>open source</a>
          , and communicates directly with Crunchyroll, and no data is ever stored.
        </p>
      </Alert>
    )
  }
}

export default connect((state) => {
  return {
    visible: state.Options.aboutVisible && state.Auth.guest
  }
})(AboutAlert)

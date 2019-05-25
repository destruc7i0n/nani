import React, { Component } from 'react'

import { Alert } from 'reactstrap'

class MangaDisclaimer extends Component {
  render () {
    return (
      <Alert color='info'>
        <h5 className='alert-heading'>Manga Information</h5>
        <p className='mb-0'>
          This is still an in-development viewer. Please post any feedback in the GitHub issues!
        </p>
      </Alert>
    )
  }
}

export default MangaDisclaimer

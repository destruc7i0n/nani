import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default ({ size = '3x' }) => (
  <div className='col-sm-12 text-center p-2'>
    <FontAwesomeIcon icon='circle-notch' size={size} pulse />
  </div>
)

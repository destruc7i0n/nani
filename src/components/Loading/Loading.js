import React from 'react'

import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faCircleNotch from '@fortawesome/fontawesome-free-solid/faCircleNotch'

export default ({ size = '3x' }) => (
  <div className='col-sm-12 text-center p-2'>
    <FontAwesomeIcon icon={faCircleNotch} size={size} pulse />
  </div>
)

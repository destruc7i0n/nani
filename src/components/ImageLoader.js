import React from 'react'

import Loading from './Loading'

export default ({ height = 0 }) => (
  <div className='bg-light d-flex align-items-center justify-content-center text-primary' style={{
    height: height > 0 ? `${height}px` : '100%'
  }}>
    <Loading />
  </div>
)

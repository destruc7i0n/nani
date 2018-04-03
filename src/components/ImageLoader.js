import React from 'react'

import Loading from './Loading'

export default ({ height = 200 }) => (
  <div className='bg-light d-flex align-items-center justify-content-center text-primary' style={{ height: `${height}px` }}>
    <Loading />
  </div>
)

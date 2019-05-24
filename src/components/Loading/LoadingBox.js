import React from 'react'

import { Card } from 'reactstrap'

import ContentLoader from 'react-content-loader'

const LoadingBox = ({ theme = 'light' }) => (
  <div className={`col-12`}>
    <Card className='d-inline-block w-100 box-shadow'>
      <ContentLoader
        speed={2}
        height={800}
        width={500}
        primaryColor={theme === 'light' ? '#f3f3f3' : '#38393a'}
        secondaryColor={theme === 'light' ? '#f7f7f7' : '#3e3f3f'}
        preserveAspectRatio={'none'}
      >
        <rect x='0' y='0' rx='0' ry='0' width='500' height='800' />
      </ContentLoader>
    </Card>
  </div>
)

export default LoadingBox

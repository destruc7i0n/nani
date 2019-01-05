import React from 'react'

import { Card } from 'reactstrap'

import ContentLoader from 'react-content-loader'

const LoadingSeriesCard = ({ theme = 'light' }) => (
  <div className='col-6 col-sm-4 col-md-4 col-lg-2 d-flex pb-4'>
    <Card className='d-inline-block w-100 box-shadow'>
      <ContentLoader
        speed={2}
        height={325}
        width={200}
        primaryColor={theme === 'light' ? '#f3f3f3' : '#38393a'}
        secondaryColor={theme === 'light' ? '#f7f7f7' : '#3e3f3f'}
      >
        <rect x='0' y='0' rx='5' ry='5' width='200' height='240' />
        <rect x='10' y='250' rx='5' ry='5' width='100' height='25' />
        <rect x='10' y='280' rx='5' ry='5' width='175' height='20' />
      </ContentLoader>
    </Card>
  </div>
)

export default LoadingSeriesCard

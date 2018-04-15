import React from 'react'

import { Card } from 'reactstrap'

import ContentLoader from 'react-content-loader'

const LoadingSeriesCard = () => (
  <div className='col-6 col-sm-4 col-md-4 col-lg-2 d-flex pb-4'>
    <Card className='d-inline-block w-100 box-shadow'>
      <ContentLoader
        speed={2}
        height={300}
        width={200}
        primaryColor='#f3f3f3'
        secondaryColor='#ecebeb'
      >
        <rect x='0' y='0' rx='5' ry='5' width='200' height='230' />
        <rect x='10' y='240' rx='5' ry='5' width='100' height='25' />
        <rect x='10' y='270' rx='5' ry='5' width='175' height='20' />
      </ContentLoader>
    </Card>
  </div>
)

export default LoadingSeriesCard

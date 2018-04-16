import React from 'react'

import { Card } from 'reactstrap'

import ContentLoader from 'react-content-loader'

const LoadingMediaCard = ({ width }) => (
  <div className={`col-12 col-sm-6 col-lg-${width} d-flex pb-4`}>
    <Card className='d-inline-block w-100 box-shadow'>
      <ContentLoader
        speed={2}
        height={300}
        width={400}
        primaryColor='#f3f3f3'
        secondaryColor='#f7f7f7'
      >
        <rect x='0' y='0' rx='5' ry='5' width='400' height='230' />
        <rect x='10' y='240' rx='5' ry='5' width='300' height='25' />
        <rect x='10' y='270' rx='5' ry='5' width='350' height='20' />
      </ContentLoader>
    </Card>
  </div>
)

export default LoadingMediaCard

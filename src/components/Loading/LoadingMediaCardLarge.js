import React from 'react'

import { Card } from 'reactstrap'

import ContentLoader from 'react-content-loader'

const LoadingMediaCard = ({ theme = 'light' }) => (
  <div className='col-12 col-sm-12 d-flex pb-4'>
    <Card className='d-inline-block w-100 box-shadow'>
      <ContentLoader
        speed={2}
        height={200}
        width={1000}
        primaryColor={theme === 'light' ? '#f3f3f3' : '#38393a'}
        secondaryColor={theme === 'light' ? '#f7f7f7' : '#3e3f3f'}
      >
        {/* image */}
        <rect x='0' y='0' rx='0' ry='0' width='330' height='200' />
        {/* title and show name */}
        <rect x='355' y='10' rx='5' ry='5' width='200' height='25' />
        <rect x='355' y='40' rx='5' ry='5' width='250' height='15' />
        {/* description */}
        <rect x='355' y='70' rx='5' ry='5' width='625' height='20' />
        <rect x='355' y='95' rx='5' ry='5' width='625' height='20' />
        <rect x='355' y='120' rx='5' ry='5' width='625' height='20' />
        {/* buttons */}
        <rect x='355' y='170' rx='5' ry='5' width='100' height='30' />
        <rect x='460' y='170' rx='5' ry='5' width='150' height='30' />
        <rect x='615' y='170' rx='5' ry='5' width='100' height='30' />
      </ContentLoader>
    </Card>
  </div>
)

export default LoadingMediaCard

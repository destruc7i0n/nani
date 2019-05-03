import React, { Component, Fragment } from 'react'

import { connect } from 'react-redux'

import ContentLoader from 'react-content-loader'

import { Card, CardBody } from 'reactstrap'
import LoadingMediaCard from './LoadingMediaCard'

class LoadingSeriesPage extends Component {
  render () {
    const { theme } = this.props

    const primary = theme === 'light' ? '#f3f3f3' : '#38393a'
    const secondary = theme === 'light' ? '#f7f7f7' : '#3e3f3f'

    const isMobile = window.matchMedia('(max-width: 992px)').matches

    let multiplier = 1
    let heightAddition = 0
    if (isMobile) {
      multiplier = 2
      heightAddition = 20
    }

    return (
      <Fragment>
        {/* series banner */}
        <div className='series-banner'>
          <ContentLoader
            speed={2}
            height={1}
            width={1}
            primaryColor={primary}
            secondaryColor={secondary}
            preserveAspectRatio={'none'}
          >
            <rect x='0' y='0' rx='0' ry='0' width='1' height='1' />
          </ContentLoader>
        </div>

        <div className='container'>
          <Card className='border-0 over-banner'>
            <CardBody className='main-details-card-body'>
              <div className='row'>
                <div className='col-sm-4 col-lg-3'>
                  {/* poster and button */}
                  <div className='sticky-poster'>
                    <ContentLoader
                      speed={2}
                      height={480}
                      width={300}
                      primaryColor={primary}
                      secondaryColor={secondary}
                      // preserveAspectRatio={'none'}
                    >
                      <rect x='0' y='0' rx='0' ry='0' width='300' height='400' />
                      {/* button */}
                      <rect x='0' y='410' rx='5' ry='5' width='300' height='50' />
                    </ContentLoader>
                  </div>
                </div>

                <div className='col-sm-8 col-lg-9'>
                  <ContentLoader
                    speed={2}
                    height={220 + heightAddition}
                    width={500}
                    primaryColor={primary}
                    secondaryColor={secondary}
                  >
                    {/* title */}
                    <rect x='0' y='0' rx='0' ry='0' width='400' height='40' />

                    {/* description */}
                    <rect x='0' y='50' rx='0' ry='0' width='500' height='15' />
                    <rect x='0' y='70' rx='0' ry='0' width='500' height='15' />
                    <rect x='0' y='90' rx='0' ry='0' width='500' height='15' />
                    <rect x='0' y='110' rx='0' ry='0' width='500' height='15' />
                    <rect x='0' y='130' rx='0' ry='0' width='500' height='15' />

                    {/* rating */}
                    <rect x='0' y='160' rx='0' ry='0' width='200' height='15' />

                    {/* collection title */}
                    <rect x='0' y='200' rx='0' ry='0' width='500' height={20 * multiplier} />
                  </ContentLoader>

                  {/* collection cards */}
                  <div className='mt-4'>
                    <div className='row'>
                      <LoadingMediaCard width={4} theme={theme} />
                      <LoadingMediaCard width={4} theme={theme} />
                      <LoadingMediaCard width={4} theme={theme} />
                      <LoadingMediaCard width={4} theme={theme} />
                      <LoadingMediaCard width={4} theme={theme} />
                      <LoadingMediaCard width={4} theme={theme} />
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    theme: store.Options.theme
  }
})(LoadingSeriesPage)

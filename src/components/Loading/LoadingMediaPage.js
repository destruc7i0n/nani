import React, { Component, Fragment } from 'react'

import { connect } from 'react-redux'

import ContentLoader from 'react-content-loader'

class LoadingMediaPage extends Component {
  render () {
    const { theme } = this.props

    const primary = theme === 'light' ? '#f3f3f3' : '#38393a'
    const secondary = theme === 'light' ? '#f7f7f7' : '#3e3f3f'

    const isMobile = window.matchMedia('(max-width: 992px)').matches

    // some numbers to help "scale" on mobile
    let multiplier = 1
    let textHeightAddition = 0
    if (isMobile) {
      multiplier = 2
      textHeightAddition = 50
    }

    return (
      <div className='col-sm-12'>
        <div className='d-flex mb-4 mt-2 justify-content-center position-relative'>
          <div className='player-width position-relative embed-responsive embed-responsive-16by9'>
            <div className='embed-responsive-item'>
              {/* main video player */}
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
          </div>
        </div>

        <ContentLoader
          speed={2}
          height={70 * multiplier + (textHeightAddition*2)}
          width={500}
          primaryColor={primary}
          secondaryColor={secondary}
        >
          {/* title */}
          <rect x='0' y='0' rx='5' ry='5' width='500' height={20 * multiplier} />
          {/* video action buttons */}
          {isMobile ? (
            <Fragment>
              <rect x='0' y='50' rx='5' ry='5' width='500' height={10 * multiplier} />
              <rect x='0' y='75' rx='5' ry='5' width='500' height={10 * multiplier} />
              <rect x='0' y='100' rx='5' ry='5' width='500' height={10 * multiplier} />
            </Fragment>
          ) : (
            <rect x='0' y='25' rx='5' ry='5' width='400' height={10 * multiplier} />
          )}

          {/* description */}
          <rect x='0' y={40 * multiplier + textHeightAddition} rx='5' ry='5' width='500' height={8 * multiplier} />
          <rect x='0' y={50 * multiplier + textHeightAddition} rx='5' ry='5' width='500' height={8 * multiplier} />
          <rect x='0' y={60 * multiplier + textHeightAddition} rx='5' ry='5' width='500' height={8 * multiplier} />
        </ContentLoader>
      </div>
    )
  }
}

export default connect((store) => {
  return {
    theme: store.Options.theme
  }
})(LoadingMediaPage)

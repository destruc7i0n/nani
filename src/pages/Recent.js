import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getRecent } from '../actions'
import { Helmet } from 'react-helmet'

import { isToday, isYesterday, differenceInCalendarDays } from 'date-fns'

import Collection from '../components/Collection'
import Loading from '../components/Loading'

class Recent extends Component {
  async componentDidMount () {
    const { dispatch } = this.props
    try {
      await dispatch(getRecent())
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const { recent } = this.props

    const days = recent.reduce((days, r) => {
      const recent = r.most_recent_media
      const id = recent.media_id
      const time = new Date(recent.available_time)
      let name = ''
      if (isToday(time)) {
        name = 'Today'
      } else if (isYesterday(time)) {
        name = 'Yesterday'
      } else {
        name = `${differenceInCalendarDays(new Date(), time)} days ago`
      }
      if (!days[name]) days[name] = []
      days[name].push(id)
      return days
    }, {})

    return (
      <Fragment>
        <Helmet>
          <title>Recent - nani</title>
        </Helmet>
        <h3 className='border-bottom pb-3 mb-4'>Recent</h3>
        {
          Object.keys(days).length > 0
            ? Object.keys(days).map((d, index) =>
              <Collection title={d} titleTag='h4' mediaIds={days[d]} key={`recentCollection-${index}`} showTime />
            )
            : <Loading size='2x' />
        }
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    recent: store.Data.recent
  }
})(Recent)

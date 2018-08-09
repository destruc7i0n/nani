import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getRecent } from '../actions'
import { Helmet } from 'react-helmet'

import { isToday, isYesterday, differenceInCalendarDays } from 'date-fns'

import Collection from '../components/Collections/Collection'

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

    // order by date
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
        <Helmet defer={false}>
          <title>Recent</title>
        </Helmet>
        <h3 className='border-bottom pb-3 mb-4'>Recent</h3>
        {
          Object.keys(days).length > 0
            ? Object.keys(days).map((d, index) =>
              <Collection title={d} titleTag='h4' mediaIds={days[d]} key={`recentCollection-${index}`} showTime />
            )
            : <Collection title={'Today'} titleTag='h4' loading loadingCardsCount={12} />
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

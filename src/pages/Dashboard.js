import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getQueueInfo, logout, search, setSearchIds } from '../actions'

import { DebounceInput } from 'react-debounce-input'
import { Link } from 'react-router-dom'

class Dashboard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      search: ''
    }
    this.search = this.search.bind(this)
  }

  async componentDidMount () {
    const { dispatch } = this.props
    try {
      await dispatch(getQueueInfo())
    } catch (e) {
      console.error(e)
    }
  }

  componentWillUnmount () {
    const { dispatch } = this.props
    // reset search ids
    dispatch(setSearchIds([]))
  }

  async search ({ target: { value } }) {
    const { dispatch } = this.props
    this.setState({ search: value })

    // trim it
    let trimmed = value.trim()
    if (trimmed === '' || trimmed.length < 3) {
      return dispatch(setSearchIds([]))
    }
    // finally, search
    await dispatch(search(trimmed))
  }

  render () {
    const { search } = this.state
    const { dispatch, searchIds, series } = this.props
    return (
      <div>
        <p>Hey! You're logged in... Good job.</p>
        <button onClick={() => dispatch(logout())}>Logout</button>
        <p>Search: <DebounceInput debounceTimeout={200} value={search} onChange={this.search} /></p>
        <ul>
          {searchIds.map((id) => (
            <li key={`result-${id}`}>
              <Link to={`/series/${id}`}>{series[id].name}</Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

export default connect((store) => {
  return {
    searchIds: store.Data.searchIds,
    series: store.Data.series
  }
})(Dashboard)

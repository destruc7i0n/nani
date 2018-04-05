import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { search, setSearchIds } from '../actions'

import { Manager, Target, Popper } from 'react-popper'
import { DebounceInput } from 'react-debounce-input'
import Img from 'react-image'

import classNames from 'classnames'

import withProxy from '../lib/withProxy'

import './SearchInput.css'

class SearchInput extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: ''
    }
    this.search = this.search.bind(this)
  }

  componentDidMount () {
    const { history } = this.props
    this.unlisten = history.listen(() => this.resetSearch())
  }

  componentWillUnmount () {
    this.unlisten()
  }

  resetSearch () {
    const { dispatch } = this.props
    // reset search ids
    dispatch(setSearchIds([]))
  }

  async search ({ target: { value } }) {
    const { dispatch } = this.props
    this.setState({ value })

    // trim it
    let trimmed = value.trim()
    if (trimmed === '' || trimmed.length < 3) {
      return dispatch(setSearchIds([]))
    }
    // finally, search
    await dispatch(search(trimmed))
  }

  render () {
    const { value } = this.state
    let { searchIds, series } = this.props
    searchIds = searchIds.splice(0, 5)
    return (
      <Manager>
        <Target>
          <DebounceInput
            name='search'
            id='search'
            placeholder='Search Crunchyroll...'
            className='form-control'
            debounceTimeout={200}
            autoComplete='off'
            value={value}
            onChange={this.search}
          />
        </Target>
        <Popper
          placement='bottom-end'
          tabIndex='-1'
          role='menu'
          className={classNames(['dropdown-menu dropdown-menu-right', { show: searchIds.length > 0 }])}>
          {
            searchIds.length === 0
              ? null
              : searchIds.map((id, index) => (
                <Link
                  to={`/series/${id}`}
                  className='dropdown-item p-2 d-flex flex-row'
                  key={`searchResult-${index}`}
                  onClick={() => this.setState({ value: '' })}
                >
                  <Img
                    src={[
                      series[id] && series[id].landscape_image && withProxy(series[id].landscape_image.small_url),
                      series[id] && series[id].landscape_image && series[id].landscape_image.small_url
                    ]}
                    className='img-fluid pr-1'
                    alt={series[id].name} />
                  <span className='d-block font-weight-bold align-middle text-truncate'>{series[id].name}</span>
                </Link>
              ))
          }
        </Popper>
      </Manager>
    )
  }
}

export default compose(
  withRouter,
  connect((store) => {
    return {
      searchIds: store.Data.searchIds,
      series: store.Data.series
    }
  })
)(SearchInput)

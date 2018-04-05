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
      searchIds: [],
      value: '',
      selectedIndex: 0
    }
    this.search = this.search.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
  }

  static getDerivedStateFromProps (nextProps) {
    const { searchIds } = nextProps
    return {
      searchIds: searchIds.splice(0, 5)
    }
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

  handleSelect (event) {
    let { selectedIndex, value, searchIds } = this.state
    const { dispatch, history } = this.props
    const { key = -1 } = event

    if (key === 'ArrowUp') { // up
      if (value === '' || value < 3) return
      event.preventDefault()
      selectedIndex -= 1
      if (selectedIndex < 0) {
        selectedIndex = searchIds.length - 1
      }
    } else if (key === 'ArrowDown') { // down
      if (value === '' || value < 3) return
      event.preventDefault()
      selectedIndex += 1
      if (selectedIndex === searchIds.length) {
        selectedIndex = 0
      }
    } else if (key === 'Enter') {
      if (value === '' || value < 3) return
      event.preventDefault()
      const resultId = searchIds[selectedIndex]
      history.push(`/series/${resultId}`)
      selectedIndex = 0
      value = ''
    } else if (key === 'Escape') {
      value = ''
      dispatch(setSearchIds([]))
    }
    this.setState({ selectedIndex, value })
  }

  render () {
    let { value, searchIds, selectedIndex } = this.state
    let { series } = this.props

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
            onKeyDown={this.handleSelect}
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
                  className={classNames('dropdown-item p-2 d-flex flex-row', { 'active': index === selectedIndex })}
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

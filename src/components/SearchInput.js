import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import { Link, withRouter } from 'react-router-dom'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { search, setSearchIds } from '../actions'

import { Manager, Target, Popper } from 'react-popper'
import { DebounceInput } from 'react-debounce-input'
import onClickOutside from 'react-onclickoutside'
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
      selectedIndex: 0,
      focused: true
    }

    this.inputElement = undefined

    this.search = this.search.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
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

  blur () {
    const inst = findDOMNode(this.inputElement)
    if (inst) inst.blur()
  }

  resetSearch () {
    const { searchIds, focused } = this.state
    const { dispatch } = this.props

    // if search results
    if (searchIds.length > 0) {
      // reset selected index
      let newState = {selectedIndex: 0, value: ''}
      // un-focus and reset value if focused
      if (focused) {
        this.blur()
        newState['focused'] = false
        // reset search ids
        dispatch(setSearchIds([]))
      }
      this.setState(newState)
    }
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

  handleKeyDown (event) {
    let { selectedIndex, value, searchIds } = this.state
    const { history } = this.props
    const { key } = event

    if (key === 'ArrowUp') { // up
      if (value === '' || value < 3) return
      event.preventDefault()
      selectedIndex -= 1
      if (selectedIndex < 0) {
        selectedIndex = searchIds.length - 1
      }
      this.setState({ selectedIndex })
    } else if (key === 'ArrowDown') { // down
      if (value === '' || value < 3) return
      event.preventDefault()
      selectedIndex += 1
      if (selectedIndex >= searchIds.length) {
        selectedIndex = 0
      }
      this.setState({ selectedIndex })
    } else if (key === 'Enter') {
      if (value === '' || value < 3) return
      event.preventDefault()
      const resultId = searchIds[selectedIndex]
      // add to the history the page and redirect
      if (resultId) {
        history.push(`/series/${resultId}`)
        selectedIndex = 0
        this.setState({ selectedIndex })
      }
    } else if (key === 'Escape') {
      // un-focus
      this.blur()
      this.setState({ focused: false })
    }
  }

  handleClickOutside () {
    const { focused } = this.state
    // only if not on mobile
    if (window.matchMedia && !window.matchMedia('(max-width: 767px)').matches && focused) {
      this.setState({ focused: false })
    }
  }

  render () {
    let { value, searchIds, selectedIndex, focused } = this.state
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
            ref={el => { this.inputElement = el }}
            onChange={this.search}
            onKeyDown={this.handleKeyDown}
            onFocus={() => this.setState({ focused: true })}
          />
        </Target>
        <Popper
          placement='bottom-end'
          tabIndex='-1'
          role='menu'
          className={classNames(['dropdown-menu dropdown-menu-right', { show: focused && searchIds.length > 0 }])}>
          {
            searchIds.length === 0
              ? null
              : searchIds.map((id, index) => (
                <Link
                  to={`/series/${id}`}
                  className={classNames('dropdown-item p-2 d-flex flex-row', { 'active': index === selectedIndex })}
                  key={`searchResult-${index}`}
                  onClick={() => this.setState({ value: '' })}
                  onMouseEnter={() => this.setState({ selectedIndex: index })}
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
  }),
  onClickOutside
)(SearchInput)

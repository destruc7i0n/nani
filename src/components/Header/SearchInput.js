import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { search, setSearchIds } from '../../actions'
import { push } from 'connected-react-router'

import { Manager, Reference, Popper } from 'react-popper'
import { DebounceInput } from 'react-debounce-input'
import Img from 'react-image'

import classNames from 'classnames'

import withProxy, { replaceHttps } from '../../lib/withProxy'

import './SearchInput.css'

class SearchInput extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: '',
      selectedIndex: 0,
      focused: false
    }

    this.inputElement = React.createRef()

    this.search = this.search.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.handleEvents = this.handleEvents.bind(this)
    this.handleDocumentClick = this.handleDocumentClick.bind(this)
  }

  componentDidMount () {
    const { history } = this.props
    this.unlisten = history.listen(() => this.resetSearch())
  }

  componentWillUnmount () {
    this.unlisten()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevState.focused !== this.state.focused) {
      this.handleEvents()
    }
  }

  blur () {
    const inst = document.getElementsByClassName('crunchyroll-search')[0]
    if (inst) inst.blur()
  }

  resetSearch () {
    const { focused } = this.state
    const { searchIds, dispatch } = this.props

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
    let { selectedIndex, value } = this.state
    const { dispatch, searchIds } = this.props
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
        dispatch(push(`/series/${resultId}`))
        selectedIndex = 0
        this.setState({ selectedIndex })
      }
    } else if (key === 'Escape') {
      // un-focus
      this.blur()
      this.setState({ focused: false })
    }
  }

  handleClickOutside (e) {
    const { focused } = this.state
    // only if not on mobile
    if (window.matchMedia && !window.matchMedia('(max-width: 767px)').matches && focused) {
      // this.setState({ focused: false })
    }
  }

  handleEvents () {
    const { focused } = this.state
    if (focused) {
      this.addEvents()
    } else {
      this.removeEvents()
    }
  }

  addEvents() {
    ['click', 'touchstart', 'keyup'].forEach(event =>
      document.addEventListener(event, this.handleDocumentClick, true)
    )
  }

  removeEvents() {
    ['click', 'touchstart', 'keyup'].forEach(event =>
      document.removeEventListener(event, this.handleDocumentClick, true)
    )
  }

  handleDocumentClick(e) {
    const keyCodes = {
      esc:   27,
      enter: 13,
      up:    38,
      down:  40,
    }

    if (e && (e.which === 3 || (e.type === 'keyup' && e.which !== keyCodes.tab))) return
    const container = this.inputElement.current

    if (!container || container.contains(e.target)) {
      return
    }

    this.setState({ focused: false })
  }

  render () {
    let { value, selectedIndex, focused } = this.state
    let { searchIds, series } = this.props

    return (
      <Manager>
        <div ref={this.inputElement}>
          <Reference>
            {({ ref }) => (
              <DebounceInput
                name='search'
                id='search'
                placeholder='Search Crunchyroll...'
                className='form-control crunchyroll-search'
                debounceTimeout={200}
                autoComplete='off'
                value={value}
                ref={ref}
                onChange={this.search}
                onKeyDown={this.handleKeyDown}
                onFocus={() => this.setState({ focused: true })}
              />
            )}
          </Reference>
          <Popper
            placement='bottom-end'
            tabIndex='-1'
            role='menu'
          >
            {({ ref, style, placement }) => (
              <div
                ref={ref}
                style={{...style, top: '100%'}}
                data-placement={placement}
                className={classNames(['dropdown-menu dropdown-menu-right', { show: focused && searchIds.length > 0 }])}
              >
                {searchIds.map((id, index) => (
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
                        series[id] && series[id].landscape_image && replaceHttps(series[id].landscape_image.small_url)
                      ]}
                      className='img-fluid pr-1'
                      alt={series[id].name} />
                    <span className='d-block font-weight-bold align-middle text-truncate'>{series[id].name}</span>
                  </Link>
                ))}
              </div>
            )}
          </Popper>
        </div>
      </Manager>
    )
  }
}

export default compose(
  withRouter,
  connect((store) => {
    return {
      searchIds: (store.Data.searchIds || []).splice(0, 5),
      series: store.Data.series
    }
  })
)(SearchInput)

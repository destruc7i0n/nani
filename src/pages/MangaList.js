import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getMangaSeries } from '../actions'
import { Helmet } from 'react-helmet'

import api from '../lib/api_manga'

import LoadingSeriesCard from '../components/Loading/LoadingSeriesCard'
import MangaSeriesCard from '../components/Cards/Manga/MangaSeriesCard'

import MangaDisclaimer from '../components/Manga/MangaDisclaimer'
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap'

class MangaSeriesList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      filter: {
        title: 'Popular',
        value: 'popular'
      },
      filters: []
    }

    this.getFilters = this.getFilters.bind(this)
    this.getList = this.getList.bind(this)
  }

  async componentDidMount () {
    await this.getList()

    this.setState({ loading: false })

    await this.getFilters()
  }

  async componentDidUpdate (prevProps, prevState) {
    if (prevState.filter.value !== this.state.filter.value) {
      this.setState({ loading: true })

      await this.getList()

      this.setState({ loading: false })
    }
  }

  async getList () {
    const { filter: { value: filter } } = this.state
    const { dispatch } = this.props

    await dispatch(getMangaSeries(null, filter))
  }

  async getFilters () {
    const { data: filters } = await api({ route: 'list_filters' })

    if (!filters) return

    // get the dropdown data
    const getFilters = (filterData) => {
      let filters = []
      for (let data of filterData) {
        let filter = {
          title: data.title,
          header: data['sub-filters'].length !== 0,
          value: data.slug,
        }

        filters.push(filter)
        if (filter.header) {
          filters.push(...getFilters(data['sub-filters']))
        }
      }
      return filters
    }

    const filterDropdown = getFilters(filters)
    this.setState({ filters: filterDropdown })
  }

  render () {
    const { loading, filter : { value: filter, title: filterTitle }, filters } = this.state
    const { list, theme } = this.props

    const mangaList = list[filter] || []

    return (
      <Fragment>
        <Helmet defer={false}>
          <title>{`Manga List`}</title>
        </Helmet>

        <MangaDisclaimer />

        <h3 className='border-bottom pb-3 mb-4'>
          <div className='d-flex justify-content-between'>
            Manga Series
          </div>
        </h3>

        <div className='d-flex w-100 justify-content-end'>
          <UncontrolledDropdown>
            <DropdownToggle caret>
              Sort By: {filterTitle}
            </DropdownToggle>
            <DropdownMenu>
              {filters.map((filter) => (
                <DropdownItem
                  key={`mangaSort-${filter.title}`}
                  header={filter.header}
                  onClick={() => !filter.header && this.setState({ filter })}
                >{filter.title}</DropdownItem>
              ))}
              {!filters.length && <DropdownItem header>Loading...</DropdownItem>}
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>

        <div className='mb-4' />

        <div className='row'>
          {
            loading
              ? [...Array(18).keys()].map((index) => <LoadingSeriesCard theme={theme} key={`loadingSeriesCard-${index}`} />)
              : mangaList.map((data, index) => <MangaSeriesCard data={data} key={`mangaSeriesCard-${index}`} />)
          }
        </div>
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    list: store.Manga.list,
    theme: store.Options.theme
  }
})(MangaSeriesList)

import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getCategories, getSeriesList } from '../actions'
import { push } from 'connected-react-router'
import { Helmet } from 'react-helmet'

import SeriesCardCollection from '../components/Collections/SeriesCardCollection'

class SeriesList extends Component {
  async componentDidMount () {
    const { dispatch, type } = this.props
    try {
      const categories = await dispatch(getCategories())

      let genreTags = categories.genre.map(({ tag }) => tag)
      let seasonTags = categories.season.map(({ tag }) => tag)

      let plainTags = ['simulcast', 'popular', 'newest']
      let possibleTags = [...plainTags, ...genreTags, ...seasonTags]

      if (possibleTags.includes(type)) {
        if (plainTags.includes(type)) {
          dispatch(getSeriesList(type))
        } else {
          dispatch(getSeriesList(`tag:${type}`))
        }
      } else {
        dispatch(push('/'))
      }
    } catch (e) {
      console.error(e)
    }
  }

  render () {
    const { list, type, categories } = this.props
    const loaded = list && list[type]

    let combinedCategories = []
    if (Object.keys(categories).length) {
      combinedCategories = [...categories.genre, ...categories.season]
    }
    combinedCategories = combinedCategories.reduce((acc, { label, tag }) => {
      acc[tag] = label
      return acc
    }, {})

    const titles = {
      simulcast: 'Simulcasts',
      popular: 'Popular Anime',
      newest: 'Newest Anime',
      ...combinedCategories
    }
    return (
      <Fragment>
        <Helmet defer={false}>
          <title>{`${titles[type]} List`}</title>
        </Helmet>
        <SeriesCardCollection title={titles[type]} loading={!loaded} series={loaded && list[type].list} />
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    list: store.Data.list,
    categories: store.Data.categories
  }
})(SeriesList)

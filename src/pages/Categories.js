import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getCategories } from '../actions'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { Button } from 'reactstrap'

import Loading from '../components/Loading/Loading'

class SeriesList extends Component {
  async componentDidMount () {
    const { dispatch } = this.props
    try {
      dispatch(getCategories())
    } catch (e) {
      console.error(e)
    }
  }

  render () {
    const { categories } = this.props
    const loaded = Object.keys(categories).length

    const CategoryButton = ({label, value}) =>
      <div className='col-sm-4 col-lg-2 mb-4'>
        <Button color='light' block tag={Link} to={`/list/${value}`}>{label}</Button>
      </div>

    return (
      <Fragment>
        <Helmet defer={false}>
          <title>Categories</title>
        </Helmet>

        <h3 className='border-bottom pb-3 mb-4'>Genres</h3>
        <div className='row'>
          { loaded ? categories.genre.map((genre, index) => <CategoryButton key={`genre-${index}`} label={genre.label} value={genre.tag} />) : <Loading size='2x' /> }
        </div>
        <h3 className='border-bottom pb-3 mb-4'>Seasons</h3>
        <div className='row'>
          { loaded ? categories.season.map((season, index) => <CategoryButton key={`season-${index}`} label={season.label} value={season.tag} />) : <Loading size='2x' /> }
        </div>
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    categories: store.Data.categories
  }
})(SeriesList)

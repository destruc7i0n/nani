import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getMalItem } from '../../actions'

import axios from 'axios'

import { Badge } from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class MALButton extends Component {
  constructor (props) {
    super(props)
    this.state = {
      id: '0',
      available: false,
      malItem: {},
      updated: false,
      loggedIn: false
    }

    this.checkOnMAL = this.checkOnMAL.bind(this)
    this.updateMAL = this.updateMAL.bind(this)
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const { id: prevId, loggedIn: oldLoggedIn } = prevState
    const { id: nextId, mal } = nextProps
    const isLoggedIn = mal.username && mal.token && true
    // reset on update or auth change
    if (nextId !== prevId || isLoggedIn !== oldLoggedIn) {
      return {
        id: nextProps.id,
        available: false,
        malItem: {},
        updated: false,
        loggedIn: isLoggedIn
      }
    }
    return null
  }

  async componentDidMount () {
    await this.checkOnMAL()
  }

  async componentDidUpdate (prevProps, prevState) {
    const { id: nextId, loggedIn: newLoggedIn } = this.state
    const { id: prevId, loggedIn: oldLoggedIn } = prevState
    // update on id change or auth change
    if (nextId !== prevId || newLoggedIn !== oldLoggedIn) {
      await this.checkOnMAL()
    }
  }

  async checkOnMAL () {
    const { loggedIn } = this.state
    const { dispatch, media, id } = this.props
    if (media && media.collection_name && id && loggedIn) {
      try {
        const data = await dispatch(getMalItem(media.collection_name, id))
        this.setState({ available: true, malItem: data })
      } catch (err) {
        console.error(err)
      }
    }
  }

  async updateMAL (e) {
    e.preventDefault()
    const { malItem, updated, loggedIn } = this.state
    const { media: { media_id: id }, collectionMedia, mal } = this.props
    // check if logged in etc.
    if (malItem && loggedIn && !updated) {
      // get the index, which is about the same as the episode number
      const episode = collectionMedia.indexOf(id) + 1
      // completed if this episode is the last one in the list
      const status = episode === collectionMedia.length ? 'completed' : 'watching'

      try {
        // post
        await axios.post('/.netlify/functions/mal_update', {
          token: mal.token,
          id: malItem.id,
          episode,
          status
        })
        this.setState({ updated: true })
      } catch (err) {
        console.error(err)
      }
    }
  }

  render () {
    const { available, updated, malItem, loggedIn } = this.state
    const { dispatch, collectionMedia, series, media, ...props } = this.props
    return loggedIn && available ? (
      <Fragment>
        <Badge
          href='#'
          color={updated ? 'success' : 'danger'}
          onClick={this.updateMAL}
          {...props}
        >
          MAL:
          &nbsp;
          <FontAwesomeIcon icon={updated ? 'check-circle' : 'times-circle'} />
        </Badge>
        <Badge
          href={`https://myanimelist.net/anime/${malItem.id}`}
          target='_blank'
          rel='noopener noreferrer'
          color='dark'
          {...props}
        >
          View on MyAnimeList
        </Badge>
      </Fragment>
    ) : null
  }
}

export default connect((store, props) => {
  const { media: { collection_id: collectionId = 0 } = {} } = props
  return {
    mal: store.Auth.mal,
    collectionMedia: store.Data.collectionMedia[collectionId]
  }
})(MALButton)

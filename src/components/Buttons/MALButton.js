import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

import axios from 'axios'

import { Badge } from 'reactstrap'

import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faCheckCircle from '@fortawesome/fontawesome-free-solid/faCheckCircle'
import faTimesCircle from '@fortawesome/fontawesome-free-solid/faTimesCircle'

class MALButton extends Component {
  constructor (props) {
    super(props)
    this.state = {
      id: '0',
      available: false,
      malItem: {},
      updated: false
    }

    this.checkOnMAL = this.checkOnMAL.bind(this)
    this.updateMAL = this.updateMAL.bind(this)
    this.isLoggedIn = this.isLoggedIn.bind(this)
  }

  isLoggedIn (props = this.props) {
    const { mal } = props
    return mal.username && mal.token && true
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const { id: prevId } = prevState
    const { id: nextId } = nextProps
    // reset on update
    if (nextId !== prevId) {
      return {
        id: nextProps.id,
        available: false,
        malItem: {},
        updated: false
      }
    }
    return null
  }

  async componentDidMount () {
    await this.checkOnMAL()
  }

  async componentDidUpdate (prevProps, prevState) {
    const { id: nextId } = this.state
    const { id: prevId } = prevState
    if (nextId !== prevId) {
      await this.checkOnMAL()
    }
  }

  async checkOnMAL () {
    const { media, id } = this.props
    if (media && media.collection_name && id && this.isLoggedIn()) {
      try {
        const {data: {error, success, data}} = await axios.get(`/.netlify/functions/mal_search?name=${media.collection_name}`)
        if (!error && success) {
          this.setState({ available: true, malItem: data })
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  async updateMAL (e) {
    e.preventDefault()
    const { malItem, updated } = this.state
    const { id, collectionMedia, mal } = this.props
    // check if logged in etc.
    if (malItem && this.isLoggedIn() && !updated) {
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
    const { available, updated, malItem } = this.state
    const { dispatch, collectionMedia, series, media, ...props } = this.props
    return this.isLoggedIn() && available ? (
      <Fragment>
        <Badge
          href='#'
          color={updated ? 'success' : 'danger'}
          onClick={this.updateMAL}
          {...props}
        >
          MAL:
          &nbsp;
          <FontAwesomeIcon icon={updated ? faCheckCircle : faTimesCircle} />
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

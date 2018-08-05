import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getAniListItem } from '../../actions'

import axios from 'axios'

import { Badge } from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class AniListButton extends Component {
  constructor (props) {
    super(props)
    this.state = {
      id: '0',
      available: false,
      anilistItem: {},
      updated: false,
      loggedIn: false
    }

    this.getEpisode = this.getEpisode.bind(this)
    this.checkOnAniList = this.checkOnAniList.bind(this)
    this.updateAniList = this.updateAniList.bind(this)
  }

  // figure out the best episode number...
  getEpisode (anilistData) {
    // grab crunchyroll's episode number
    let { media: { episode_number: crunchyrollEpisode, media_id: id }, collectionMedia } = this.props
    // if it isn't a valid episode, fallback to a special number
    crunchyrollEpisode = Number(crunchyrollEpisode) || (2 ** 16) - 1
    // calculate an episode based on the index in array
    const calculatedEpisode = collectionMedia.indexOf(id) + 1
    const episodeCount = anilistData.episodes
    // if the crunchyroll episode is larger than the amount of episodes on anilist, fallback on the calculated
    if (crunchyrollEpisode > episodeCount) {
      return calculatedEpisode
    }
    // default to the crunchyroll provided episode
    return crunchyrollEpisode
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const { id: prevId, loggedIn: oldLoggedIn } = prevState
    const { id: nextId, anilist } = nextProps
    const isLoggedIn = anilist.username && anilist.token && true
    // reset on update or auth change
    if (nextId !== prevId || isLoggedIn !== oldLoggedIn) {
      return {
        id: nextProps.id,
        available: false,
        anilistItem: {},
        updated: false,
        loggedIn: isLoggedIn
      }
    }
    return null
  }

  async componentDidMount () {
    await this.checkOnAniList()
  }

  async componentDidUpdate (prevProps, prevState) {
    const { id: nextId, loggedIn: newLoggedIn } = this.state
    const { id: prevId, loggedIn: oldLoggedIn } = prevState
    // update on id change or auth change
    if (nextId !== prevId || newLoggedIn !== oldLoggedIn) {
      await this.checkOnAniList()
    }
  }

  async checkOnAniList () {
    const { loggedIn } = this.state
    const { dispatch, media } = this.props
    if (media && media.collection_name && loggedIn) {
      try {
        const data = await dispatch(getAniListItem(media.collection_name, media.collection_id))

        const episode = this.getEpisode(data)
        const progress = data && data.mediaListEntry && data.mediaListEntry.progress

        // if the episode is less than or equal to than the progress, this episode has been watched
        const watched = episode <= progress

        this.setState({ updated: watched, available: true, anilistItem: data })
      } catch (err) {
        console.error(err)
      }
    }
  }

  async updateAniList (e) {
    e.preventDefault()
    const { anilistItem, updated, loggedIn } = this.state
    const { dispatch, media, anilist: { token } } = this.props
    // check if logged in etc.
    if (anilistItem && loggedIn && !updated) {
      // get the episode
      const episode = this.getEpisode(anilistItem)
      // completed if this episode is the same as the number in the series
      const status = episode === anilistItem.episodes ? 'COMPLETED' : 'CURRENT'

      try {
        // post and update
        await axios.post('https://graphql.anilist.co', {
          query: `
            mutation ($mediaId: Int, $progress: Int, $status: MediaListStatus) {
              SaveMediaListEntry (mediaId: $mediaId, progress: $progress, status: $status) {
                id
                status
              }
            }
          `,
          variables: {
            mediaId: anilistItem.id,
            progress: episode,
            status
          }
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        // force update the anilist item again
        dispatch(getAniListItem(media.collection_name, media.collection_id, true))
        this.setState({ updated: true })
      } catch (err) {
        console.error(err)
      }
    }
  }

  render () {
    const { available, updated, anilistItem, loggedIn } = this.state
    const { dispatch, collectionMedia, series, media, ...props } = this.props
    return loggedIn && available ? (
      <Fragment>
        <Badge
          href='#'
          color={updated ? 'success' : 'danger'}
          onClick={this.updateAniList}
          {...props}
        >
          AniList:
          &nbsp;
          <FontAwesomeIcon icon={updated ? 'check-circle' : 'times-circle'} />
        </Badge>
        <Badge
          href={`https://anilist.co/anime/${anilistItem.id}`}
          target='_blank'
          rel='noopener noreferrer'
          color='dark'
          {...props}
        >
          View on AniList
        </Badge>
      </Fragment>
    ) : null
  }
}

export default connect((store, props) => {
  const { media: { collection_id: collectionId = '0' } = {} } = props
  return {
    collectionMedia: store.Data.collectionMedia[collectionId] || {},
    anilist: store.Auth.anilist
  }
})(AniListButton)

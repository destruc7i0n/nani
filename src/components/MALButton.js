import React, { Component } from 'react'
import { connect } from 'react-redux'

import axios from 'axios'
import { isEqual } from 'lodash'

import { Badge } from 'reactstrap'

import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import { faCheckCircle, faTimesCircle } from '@fortawesome/fontawesome-free-solid'

class MALButton extends Component {
  constructor (props) {
    super(props)
    this.state = {
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
    return mal.username && mal.token
  }

  async componentDidMount () {
    if (this.isLoggedIn()) await this.checkOnMAL()
  }

  async componentWillReceiveProps (nextProps) {
    if (this.isLoggedIn(nextProps) && !isEqual(nextProps, this.props)) {
      await this.checkOnMAL()
    }
  }

  async checkOnMAL () {
    const { media, id } = this.props
    if (media && media.collection_name && id) {
      this.setState({ available: false, updated: false })
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
    const { available, updated } = this.state
    const { dispatch, ...props } = this.props
    return this.isLoggedIn() && available ? (
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
    ) : null
  }
}

export default connect((store, props) => {
  const { media: { collection_id: id = 0 } = {} } = props
  return {
    mal: store.Auth.mal,
    collectionMedia: store.Data.collectionMedia[id]
  }
})(MALButton)

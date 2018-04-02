// https://github.com/paluh/clappr-responsive-container-plugin/blob/master/src/index.js

import {UICorePlugin, PlayerInfo, $} from 'clappr'

export default class ResponsiveContainer extends UICorePlugin {
  get name () { return 'responsive_container' }

  constructor (core) {
    super(core)
    let playerInfo = PlayerInfo.getInstance(this.options.playerId)
    this.playerWrapper = playerInfo.options.parentElement
    $(document).ready(() => { this.resize() })
  }
  bindEvents () {
    $(window).resize(() => {
      this.resize()
    })
  }
  resize () {
    const width = (this.playerWrapper.clientWidth === 0 ? this.options.width : this.playerWrapper.clientWidth)
    const height = this.options.height / this.options.width * width
    this.core.resize({ width: width, height: height })
  }
}

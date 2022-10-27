const axios = require('axios').default

class PeerTube {
  constructor(ptInstance, ptChannelName) {
    const ptApi = `${ptInstance}/api/v1`

    this.ptAllVideosUrl = `${ptApi}/users/me/videos`
    this.ptUpdateVideoUrl = `${ptApi}/videos`
    this.ptGetChannelUrl = `${ptApi}/video-channels/${ptChannelName}`
    this.ptOauthClientsUrl = `${ptApi}/oauth-clients/local`
    this.ptAuthUrl = `${ptApi}/users/token`
    this.ptImportUrl = `${ptApi}/videos/imports`

    this.loadChannelId()
  }

  async channelVideos() {
    return this._channelVideoOnPage()
  }

  async _channelVideoOnPage(offset = 0) {
    const perPage = 50
    const resp = await axios.get(this.ptAllVideosUrl, {
      params: { count: perPage, start: offset },
      headers: { Authorization: `Bearer ${this.authResponseData.access_token}` },
    })

    return resp.data.total <= offset + perPage
      ? resp.data.data
      : resp.data.data.concat(await this._channelVideoOnPage(offset + perPage))
  }

  async updateLangAndPriv(video) {
    return await axios.put(`${this.ptUpdateVideoUrl}/${video.id}`,
      { language: 'pt', privacy: '1' },
      { headers: { Authorization: `Bearer ${this.authResponseData.access_token}` } },
    )
  }

  async updateDescription(video, newDescription) {
    return await axios.put(`${this.ptUpdateVideoUrl}/${video.id}`,
      { description: newDescription },
      { headers: { Authorization: `Bearer ${this.authResponseData.access_token}` } },
    )
  }

  async loadChannelId() {
    const channelResponse = await axios.get(this.ptGetChannelUrl)
    const channelResponseData = channelResponse.data

    this.ptChannelId = channelResponseData.id
    return channelResponseData.id
  }

  async authenticate(ptUsername, ptPassword) {
    const oauthClients = await axios.get(this.ptOauthClientsUrl)
    const oauthClientsData = oauthClients.data

    const authData = {
      'client_id': oauthClientsData.client_id,
      'client_secret': oauthClientsData.client_secret,
      'grant_type': 'password',
      'response_type': 'code',
      'username': ptUsername,
      'password': ptPassword,
    }

    const authResponse = await axios.post(
      this.ptAuthUrl,
      Object.entries(authData).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&'),
      { 'content-type': 'application/x-www-form-urlencoded' }
    )

    this.authResponseData = authResponse.data
    return this.authResponseData
  }

  async importVideo(videoUrl, videoName) {
    const postData = {
      channelId: this.ptChannelId,
      name: videoName,
      targetUrl: videoUrl,
      language: 'pt',
      privacy: '1'
    }

    const importResponse = await axios.post(
      this.ptImportUrl,
      postData,
      { headers: { Authorization: `Bearer ${this.authResponseData.access_token}` }}
    )

    return importResponse.data
  }
}

module.exports = PeerTube

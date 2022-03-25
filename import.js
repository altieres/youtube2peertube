const axios = require('axios').default
const xml2js = require('xml2js')

const Peertube = require('./peertube')

const ytBaseVideoUrl = 'https://www.youtube.com/watch?v='
const ytBaseRssUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id='

const ytChannelId = process.env.YT_CHANNEL_ID
const ptInstance = process.env.PT_INSTANCE
const ptChannelName = process.env.PT_CHANNEL_NAME
const ptUsername = process.env.PT_USERNAME
const ptPassword = process.env.PT_PASSWORD
const dry = process.env.DRY_RUN
const ytRssUrl = `${ytBaseRssUrl}${ytChannelId}`
console.log(ytRssUrl)

const peertube = new Peertube(ptInstance, ptChannelName)

;(async function() {
  const ytRecentVideos = await axios.get(ytRssUrl)
  const ytRecentVideosData = await xml2js.parseStringPromise(ytRecentVideos.data)
  const last15Videos = ytRecentVideosData.feed.entry

  const channelVideosData = await peertube.channelVideos()

  console.log('Importation summary:')
  console.log('Youtube rss videos: ', last15Videos.length)
  console.log('Peertube total videos: ', channelVideosData.length)

  await peertube.authenticate(ptUsername, ptPassword)

  for await (let ytVideo of last15Videos) {
    const ytVideoId = ytVideo['yt:videoId']
    const ytVideoName = ytVideo['title'][0]
    const ytVideoUrl = `${ytBaseVideoUrl}${ytVideoId}`

    const alreadyUploaded = channelVideosData.find((v) => v.name === ytVideoName)
    if (!alreadyUploaded) {
      console.log('Uploading:', ytVideoName)
      if (dry === 'false') {
        const importResponseData = await peertube.importVideo(ytVideoUrl, ytVideoName)
        console.log('importResponseData:', importResponseData)
      } else {
        console.log('DRY run, change to false on .env to upload')
      }
    }
  }
})();

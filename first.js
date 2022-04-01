const Peertube = require('./peertube')
const all = require('./all')

const ytBaseVideoUrl = 'https://www.youtube.com/watch?v='

const ptInstance = process.env.PT_INSTANCE
const ptChannelName = process.env.PT_CHANNEL_NAME
const ptUsername = process.env.PT_USERNAME
const ptPassword = process.env.PT_PASSWORD
const dry = process.env.DRY_RUN

const peertube = new Peertube(ptInstance, ptChannelName)

;(async function() {
  await peertube.authenticate(ptUsername, ptPassword)

  const channelVideosData = await peertube.channelVideos()

  console.log('Importation summary:')
  console.log('Youtube total videos (all.js file): ', all.length)
  console.log('Peertube total videos: ', channelVideosData.length)

  await peertube.authenticate(ptUsername, ptPassword)

  for await (let ytVideo of all.reverse()) {
    const ytVideoId = ytVideo.id
    const ytVideoName = ytVideo.title
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

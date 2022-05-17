const fs = require('fs')
const Peertube = require('./peertube')
const all = require('./all')

const ytBaseVideoUrl = 'https://www.youtube.com/watch?v='

const ytToPt = JSON.parse(fs.readFileSync('ytToPt.json'))

const ptInstance = process.env.PT_INSTANCE
const ptChannelName = process.env.PT_CHANNEL_NAME
const ptUsername = process.env.PT_USERNAME
const ptPassword = process.env.PT_PASSWORD
const dry = process.env.DRY_RUN

const peertube = new Peertube(ptInstance, ptChannelName)

;(async function() {
  await peertube.authenticate(ptUsername, ptPassword)

  let channelVideosData = await peertube.channelVideos()

  // for (const youtubeVideo of all) {
  //   const peertubeVideo = channelVideosData.find((v) => v.name === youtubeVideo.title)
  //   channelVideosData = channelVideosData.filter((v) => v !== peertubeVideo)
  // }

  console.log('Importation summary:')
  console.log('Youtube total videos (all.js file): ', all.length)
  console.log('Peertube total videos: ', channelVideosData.length)

  // fix privacy and language of already imported videos
  // for (const video of channelVideosData) {
  //   if (video.privacy.id == 3) await peertube.updateLangAndPriv(video)
  //   // console.log(`video`, video.name);
  // }

  let notImportedYetCount = 0
  for await (let ytVideo of all.reverse()) {
    const ytVideoId = ytVideo.id
    const ytVideoName = ytVideo.title
    const ytVideoUrl = `${ytBaseVideoUrl}${ytVideoId}`

    const alreadyUploaded = ytToPt.find((v) => v.youtube === ytVideoId)
    if (!alreadyUploaded) {
      notImportedYetCount++
      console.log('Uploading:', ytVideoName)
      if (dry === 'false') {
        const importResponseData = await peertube.importVideo(ytVideoUrl, ytVideoName)
        console.log('importResponseData:', importResponseData)

        ytToPt.push({
          title: ytVideoName,
          youtube: ytVideoId,
          peertube: importResponseData?.video?.shortUUID || '>>imported<<',
        })

        fs.writeFileSync('ytToPt.json', JSON.stringify(ytToPt.sort((a, b) => a.title > b.title ? 1 : -1)))
      } else {
        console.log('DRY run, change to false on .env to upload')
      }
      return
    }
  }

  console.log('Not imported yet: ', notImportedYetCount)
})();

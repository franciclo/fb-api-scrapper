require('dotenv').config()
const { MongoClient } = require('mongodb')
const { getAllLikes } = require('./lib/get-likes')
let { saveLikes, savePage, getLowest } = require('./lib/db')

const { MONGO_URL, DATABASE } = process.env

;(async function() {
  try {
    const db = await MongoClient.connect(MONGO_URL)
    const Pages = db.collection('pages')
    const Likes = db.collection('likes')
    await Likes.ensureIndex({user_id: 1, page_id: 1}, { unique: true })

    getLowest = getLowest.bind({ Pages })
    savePage = savePage.bind({ Pages })
    saveLikes = saveLikes.bind({ Likes })

    ;(async function restart () {
      const lowest = await getLowest()
      if (!lowest) {
        console.log('****** my work here is done ******')
        return
      }

      console.log('------------------------------')
      console.log(`  Getting likes from ${lowest.pageId}`)

      const { likeLink, postLink, lastDate, likes } = await getAllLikes(lowest.likeLink, lowest.postLink, lowest.lastDate, [])
      const savedLikes = await saveLikes(likes, lowest._id)
      const savedRatio = Math.round((savedLikes / likes.length) * 100) / 100
      let counter = lowest.counter + savedLikes
      await savePage(likeLink, postLink, lastDate, counter, lowest._id)

      console.log(`  fetched (${likes.length}) / new (${savedLikes}) = ${savedRatio}`)
      console.log('------------------------------\n')

      restart()
    })()
    
  } catch (err) {
    console.log(err)
  }
})()

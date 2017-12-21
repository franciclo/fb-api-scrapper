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

    ;(async function looper () {
      const lowest = await getLowest()
      console.log('------------------------------')
      console.log(`  scraping ${lowest.pageId}`)

      const {
        likeLink,
        postLink,
        lastDate,
        likes
      } = await getAllLikes(lowest.likeLink, lowest.postLink || lowest.pageLink, lowest.lastDate, [])
      const savedLikes = await saveLikes(likes, lowest._id)
      let counter = lowest.counter + savedLikes

      console.log(`  likes (${likes.length}) / new (${savedLikes}) = ${Math.round((savedLikes / likes.length) * 100) / 100}`)
      console.log('----------------------------')
    
      await savePage(likeLink, postLink, lastDate, counter, lowest._id)

      console.log('=============================')

      looper()
    })()
    
  } catch (err) {
    console.log(err)
  }
})()

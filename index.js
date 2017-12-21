require('dotenv').config()
const { MongoClient } = require('mongodb')
const { getAllLikes } = require('./lib/get-likes')
let { saveLikes, savePage, getLowest } = require('./lib/db')
const { MONGO_URL } = process.env

;(async function() {
  try {
    client = await MongoClient.connect(MONGO_URL)
    const db = client.db('la-grieta')
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
      try {
        const { likeLink, postLink, lastDate, likes } = await getAllLikes(lowest.likeLink, lowest.postLink || lowest.pageLink, lowest.lastDate, [])
        const savedLikes = await saveLikes(likes, lowest._id)

        console.log(`  likes (${likes.length}) / new (${savedLikes}) = ${Math.round((savedLikes / likes.length) * 100) / 100}`)
        console.log('----------------------------')
      
        let counter = lowest.counter + savedLikes
        await savePage(likeLink, postLink, lastDate, counter, lowest._id)
      
      } catch (err) {
        if (err === 'request-limit') {
          console.log('wait 20s...')
          setTimeout(() => looper(), 20000)
        } else {
          console.log(err)
        }
        return
      }
      console.log('=============================')

      looper()
    })()
    
  } catch (err) {
    console.log(err)
  }
})()

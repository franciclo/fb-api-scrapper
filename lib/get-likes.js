const request = require('requestretry')
const { RateLimiter } = require('limiter')
const { REQUESTS_MINUTE } = process.env

const limiter = new RateLimiter(REQUESTS_MINUTE, 'minute', true)

function callFb (url) {
  return new Promise((resolve, reject) => {
    limiter.removeTokens(1, function(err, remainingRequests) {
      if (remainingRequests < 1) return reject('request-limit')
      request({ url }).then(({ body }) => {
        body = JSON.parse(body)
        if (body.error) return reject(body.error)
        if (body.data) resolve(body)
      }).catch(err => reject(err))
    })
  })
}

function delay (getAllLikes, likeLink, postLink, lastDate, acc) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(getAllLikes(likeLink, postLink, lastDate, acc)), 20000)
  })
}

module.exports.getAllLikes = async function getAllLikes (likeLink, postLink, lastDate, acc) {
  let likes, entry
  try {
    if (likeLink) {
      entry = 'LIKE'
      const likesRes = await callFb(likeLink)
      likeLink = likesRes.paging && likesRes.paging.next
      likes = likesRes.data
    } else {
      entry = 'POST'
      let postRes = await callFb(postLink)
      postLink = postRes.paging && postRes.paging.next
      lastDate = postRes.data[0].created_time
      likesRes = postRes.data[0].likes
      if (!likesRes) {
        likeLink = false
        return getAllLikes(likeLink, postLink, lastDate, acc)
      }
      likes = likesRes.data
      likeLink = likesRes.paging && likesRes.paging.next
      if (!postLink) throw '%%%%%%%%%%%%%%%%%%%% no-more-posts %%%%%%%%%%%%%%%%%%%%'
    }
  } catch (err) {
    if (err === 'request-limit') {
      return await delay(getAllLikes, likeLink, postLink, lastDate, acc)
    } else {
      throw err
    }
  }
  
  console.log(`    ${entry} -----> ${likes.length}`)
  likes = likes.map(l => l.id).concat(acc)

  if (likes.length > 100) return { likeLink, postLink, lastDate, likes }
  
  return getAllLikes(likeLink, postLink, lastDate, likes)
}

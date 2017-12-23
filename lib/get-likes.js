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
  const entry = likeLink ? 'LIKE' : 'POST'
  const link = likeLink || postLink
  let res
  try {
    res = await callFb(link)
  } catch (err) {
    if (err === 'request-limit') return await delay(getAllLikes, likeLink, postLink, lastDate, acc)
    throw err
  }

  postLink = likeLink ? postLink : res.paging && res.paging.next
  if (!postLink) return { likeLink: null, postLink: null, lastDate, likes }

  lastDate = likeLink ? lastDate : res.data[0].created_time
  const likesRes = likeLink ? res : res.data[0].likes

  if (!likesRes) return getAllLikes(false, postLink, lastDate, acc)

  likeLink = likesRes.paging && likesRes.paging.next
  likes = likesRes.data.map(l => l.id).concat(acc)


  console.log(`    ${entry} -----> ${likesRes.data.length}`)
  if (likes.length > 100) return { likeLink, postLink, lastDate, likes }

  return getAllLikes(likeLink, postLink, lastDate, likes)
}

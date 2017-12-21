const { ObjectID } = require('mongodb')

module.exports.getLowest = async function getLowest () {
  const lowestLikesPage = this.Pages.find({lastDate: {$gt: new Date(2016, 1, 1)}}).sort({counter: 1}).limit(1)
  return await lowestLikesPage.next()
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

module.exports.saveLikes = async function saveLikes (likes, page_id) {
  let counter = 0
  await asyncForEach(likes.filter(x => x), async (user_id) => {
    try {
      await this.Likes.insertOne({ user_id, page_id })
      counter++
    } catch (err) {}
  })
  return counter
}

module.exports.savePage = async function savePage (likeLink, postLink, lastDate, counter, id) {
  return await this.Pages.updateOne({_id: new ObjectID(id)}, { $set: { likeLink, postLink, counter, lastDate: new Date(lastDate) } }) 
}

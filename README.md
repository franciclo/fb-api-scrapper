# Node process for getting likes from pages feeds

Requires a mongo data base with two collections:
```
pages : {
    "Id" : Integer, 
    "pageId" : String, 
    "counter" : Integer, 
    "pageLink" : String, 
    "postLink" : String, 
    "likeLink" : String, 
    "lastDate" : Date
}
```

Pages collection must be manually initialized with a list of all the pages you want, like so:

```
pages : {
    "Id" : Integer, // Integer incremental id
    "pageId" : String, // Facebook Page Id
    "counter" : Integer, // 0
    "pageLink" : String, // https://graph.facebook.com/PAGE_ID/feed/?fields=likes,created_time&limit=1&access_token=ACCESS_TOKEN
    "postLink" : String, // null
    "likeLink" : String, // null
    "lastDate" : Date  // Current datetime
}
```

Likes have a unique compound index to ensure we get one user per page.

```
likes : {
    "page_id" : ObjectId, 
    "user_id" : Integer
}
```

Must specify enviroment variables for mongo uri and rate limit:

`MONGO_URL=mongodb://localhost:27017`

`REQUESTS_MINUTE=10`

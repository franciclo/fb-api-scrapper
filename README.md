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
```
likes : {
    "page_id" : ObjectId, 
    "user_id" : Integer
}
```

Must specify enviroment variables for mongo uri and rate limit:
`MONGO_URL=mongodb://localhost:27017`
`REQUESTS_MINUTE=10`

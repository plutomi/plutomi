## MongoDB

[https://www.mongodb.com/](https://www.mongodb.com/)

We use MongoDB for our main transactional database. We run this in a replica set (1 primary and 2 secondaries) for high availability. We try to follow the pattern of storing everything in a single collection, as described [here](https://youtu.be/IYlWOk9Hu5g?t=1094).

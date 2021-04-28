let express = require('express')
let cors = require('cors')
let app = express()
const Sequelize = require('sequelize');

// instantiate the library for use, connecting to the sqlite database file
let sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'posts.sqlite'
})

// If port is set in environment variable use that port
// if not, use port 5000
const PORT = process.env.PORT || 5000

// Enable CORS middleware
app.use(cors());
// Enable receiving data in JSON format
app.use(express.json());
// Enable receiving data from HTML forms
app.use(express.urlencoded({ extended: false }));

// Start: Change only below this line

const Post = sequelize.import("./models/posts.js");

// View all posts
// Happy Path: returns all posts in an array in JSON format (Status 200)
// Sad Path: None
app.get("/posts", function(req, res){
    Post.findAll({ order: [['points', 'DESC']]}).then(function(posts){
        res.send(JSON.stringify(posts));
    });
});

// Create a post
// Happy Path: creates the post item (Status 201 - returns copy of created post)
// Sad Path: none
app.post("/posts", function(req, res){
    const post = {
        title: req.body.title,
        url: req.body.url
    };

    Post.create(post).then(function(post){
        res.status(201).send('Created post')
    }).catch(function(error){
        //res.send(error);
    })
});

// Upvote a post
// Happy Path: upvote a post (Status 204 - empty JSON)
// Sad Path: post does not exist (Status 404 - empty JSON)
app.patch("/posts/:id/upvote", function(req, res){
    Post.findByPk(req.params.id).then(function(posts){
        if(posts != null){
            posts.points = posts.points + 1
            posts.save()
            res.status(204).send('');
        }
    }).catch(function(error){
        res.status(404).send('')
    })
});

// Downvote a post
// Happy Path: downvote a post (Status 204 - empty JSON)
// Sad Path: post does not exist (Status 404 - empty JSON)
app.patch("/posts/:id/downvote", function(req, res){
    Post.findByPk(req.params.id).then(function(posts){
        if(posts != null && posts.points > 0){
            posts.points = posts.points - 1
            posts.save()
            res.status(204).send('');
        } else {
            res.status(204).send('');
        }
    }).catch(function(error){
        res.status(404).send('')
    })
});

// STOP: Don't change anything below this line

app.listen(PORT, function () {
    console.log("Server started..." + PORT)
});
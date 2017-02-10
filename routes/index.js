var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Back end dependencies
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');


// Get all posts
router.get('/posts', function(req, res, next) {
    // this is a mongodb find command
    Post.find(function(err, posts) {
        if(err) {
            return next(err);
        }
        res.json(posts);
    });
});

// Create a new post
router.post('/posts', function(req, res, next) {
    // we are grabbing the body of the request
    var post = new Post(req.body);
    // this is a mongodb save command
    post.save(function(err, post) {
        if(err) {
            return next(err);
        }
        res.json(post);
    });
});


router.param('post', function(req, res, next, id) {
// query the database by post.id
    var query = Post.findById(id);

// returns an error or the post
    query.exec(function (err, post) {
        if (err) {
            return next(err);
        }
        if (!post) {
            return next(new Error('can\'t find post'));
        }

        req.post = post;
        return next();
    })
})

router.param('comment', function(req, res, next, id) {
// query the database by comment.id
    var query = Comment.findById(id);

// returns an error or the comment
    query.exec(function (err, comment) {
        if (err) {
            return next(err);
        }
        if (!post) {
            return next(new Error('can\'t find comment'));
        }

        req.comment = comment;
        return next();
    })
})

// a route for returning a single post
router.get('/posts/:post', function(req, res) {
  res.json(req.post);
});

// We call the upvote function from models/Posts.js to increment the upvotes field by 1;
// and we just update that on the database
router.put('/posts/:post/upvote', function(req, res, next) {
    req.post.upvote(function(err, post){
        if (err) {
            return next(err);
        }

        res.json(post);
    });
});

// We call the upvote function from models/Comments.js to increment the upvotes field by 1;
// and we just update that on the database
router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
    req.comment.upvote(function(err, comment){
        if (err) {
            return next(err);
        }

        res.json(comment);
    });
});


// append a new comment to a selected post
router.post('/posts/:post/comments', function(req, res, next) {
    var comment = new Comment(req.body);
    comment.post = req.post;

// Saving the comment to the post
    comment.save(function(err, comment){
        if(err){
            return next(err);
        }

// we are appending the new comment to the pos
    req.post.comments.push(comment);

// saving that post
    req.post.save(function(err, post) {
        if(err){
            return next(err);
        }

      res.json(comment);
    });
  });
});

router.get('/posts/:post', function(req, res, next) {
  req.post.populate('comments', function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

module.exports = router;

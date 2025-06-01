const Post = require('../models/Post');
const mongoose = require('mongoose');
const path = require('path');

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find();
        res.render("homepage", {title: "Homepage", post: posts});
    } catch (err) {
        res.status(500).send(err);
    }
};

exports.getComposePage = (req, res) => {
    if(req.session.loggedIn) {
        res.render("compose", {title: "Compose", message: "You can upload photos"});
    } else {
        res.redirect("/alert2");
    }
};

exports.createPost = async (req, res) => {
    try {
        const image = req.file;
        const title = req.body.textTitle;
        const post = req.body.textPost;
        const now = new Date();
        const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
        const userName = req.session.userName;

        if(title.length > 35) {
            return res.render("compose", { title: "Compose", message: "You can enter a maximum of 35 characters for title" });
        }

        if(image && !/^image/.test(image.mimetype)) {
            return res.render("compose", {title: "Compose", message: "File type is not image or larger than 100 mb! FAILED"});
        }

        const blogPost = new Post({
            ImageUrl: image ? image.path : "",
            Title: title,
            Post: post,
            Time: formattedDate,
            Author: userName,
            Comment: []
        });

        await blogPost.save();
        res.redirect("/");
    } catch (err) {
        res.status(500).send(err);
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postID);
        res.render("post", {
            message: "",
            postID: req.params.postID,
            title: post.Title,
            textTitle: post.Title,
            textPost: post.Post,
            image: post.ImageUrl,
            time: post.Time,
            author: post.Author,
            comments: post.Comment
        });
    } catch (err) {
        res.status(500).send(err);
    }
};

exports.addComment = async (req, res) => {
    try {
        const postID = req.params.postID;
        const comment = req.body.comment;
        const now = new Date();
        const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

        if(!req.session.loggedIn) {
            const post = await Post.findById(postID);
            return res.render("post", {
                message: "You must be logged in to comment!",
                postID: postID,
                title: post.Title,
                textTitle: post.Title,
                textPost: post.Post,
                image: post.ImageUrl,
                time: post.Time,
                author: post.Author,
                comments: post.Comment
            });
        }

        const userName = req.session.userName;
        const post = await Post.findById(postID);
        
        post.Comment.push({
            Author: userName,
            Comment: comment,
            Time: formattedDate
        });

        await post.save();
        res.redirect("/posts/" + postID);
    } catch (err) {
        res.status(500).send(err);
    }
}; 
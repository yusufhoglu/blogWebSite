const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Cloudinary yapılandırması
cloudinary.config({
    secure: true
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: (req, file) => 'blog-website',
    }
});

const parser = multer({ 
    storage: storage,
    limits: {
        fileSize: 5e+7
    }
});

// Post route'ları
router.get('/', postController.getAllPosts);
router.get('/compose', postController.getComposePage);
router.post('/compose', parser.single('avatar'), postController.createPost);
router.get('/posts/:postID', postController.getPostById);
router.post('/posts/:postID', postController.addComment);

module.exports = router; 
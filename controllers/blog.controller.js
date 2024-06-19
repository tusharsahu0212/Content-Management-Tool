// const multer = require("multer");
const blogSchema = require("../models/blog.model")
const userSchema = require("../models/user.model")
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// const upload = multer({
//     limits: 15 * 1024 * 1024
// });

// const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }])

const Blog = mongoose.model('Blog', blogSchema);
const User = mongoose.model('User', userSchema);

//create
uploadBlog = async (req, res) => {


    if (req.files['image'][0].size > 15728640) {
        return res.render('upload', { ALERT: true, message: "Image size may not larger than 15MB!" })
    }

    if (req.files['video']) {
        if (req.files['video'][0].size > 15728640) {
            return res.render('upload', { ALERT: true, message: "Video size may not larger than 15MB!" })
        }
    }



    let imageBuffer = null;
    let videoBuffer = null;



    if (req.files['image']) {
        imageBuffer = await req.files['image'][0].buffer;

    }

    if (req.files['video']) {
        videoBuffer = await req.files['video'][0].buffer;

    }


    const newBlog = new Blog({
        title: req.body.title,
        content: req.body.content,
        image: imageBuffer,
        video: videoBuffer
    })

    await newBlog.save();

    let prevblogs;

    try {
        const decoded = jwt.verify(req.cookies['ACCESS_TOKEN'], process.env.ACCESS_TOKEN_SECRET);
        await User.findOne({ username: decoded.username, password: decoded.password }).then(async (data, err) => {

            if (err) {
                console.log(err);
                res.status(404);
            } else {
                prevblogs = data.blogs;
                prevblogs.push(newBlog);
            }
    
            User.updateOne({ username: decoded.username, password: decoded.password }, { blogs: prevblogs }).then((data, err) => {
    
                if (err) {
                    console.log(err);
                }
    
            });
    
    
            fs.writeFileSync(`./public/media/image/${newBlog._id}.jpg`, imageBuffer, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error saving file' });
                }
    
    
            });
    
            if (videoBuffer) {
                fs.writeFileSync(`./public/media/video/${newBlog._id}.mp4`, videoBuffer, (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Error saving file' });
                    }
    
    
                });
            }
    
    
            return res.redirect('/myBlogs');
        });

    } catch (err) {
        console.log(err);
    }




}

getUpload = (req, res) => {

    try {
        const decoded = jwt.verify(req.cookies['ACCESS_TOKEN'], process.env.ACCESS_TOKEN_SECRET);

    } catch (err) {
        return res.render("login", { ALERT: false });
    }

    return res.render('upload', { ALERT: false });
}

//read
readAllBlogs = (req, res) => {

    Blog.find().then((data) => {

        res.render("home", { data: data });
    });

}

//myblog
pMyBlogs = (req, res) => {


    User.findOne({ username: req.body.username }).then((data, err) => {

        // console.log(req.body)
        if (data) {
            res.status(200).send(data);
        } else {
            res.send(err);
        }

    });
}

gMyBlogs = (req, res) => {

    try {
        const decoded = jwt.verify(req.cookies['ACCESS_TOKEN'], process.env.ACCESS_TOKEN_SECRET);
        console.log(decoded)

        User.findOne({ username: decoded.username, password: decoded.password }).then((data, err) => {

            if (data) {
    
                return res.render('myBlogs', { data: data.blogs });
    
    
            } else {
                console.log(err);
    
            }
    
        });
    } catch (err) {
        console.log(err)
        return res.render("login", { ALERT: false });
    }

}

//update
updateBlog = async (req, res) => {

    let imageBuffer = null;
    let videoBuffer = null;

    if (req.body.image) {
        imageBuffer = await req.files['image'][0].buffer;

    }

    if (req.body.video) {
        videoBuffer = await req.files['video'][0].buffer;

    }



    Blog.updateOne({ _id: req.body.id }, {
        title: req.body.title,
        content: req.body.content,
        image: imageBuffer,
        video: videoBuffer

    }).then((data) => {

        res.status(200).send("Blog Updated");

    });


}

// blog page
blogPage = (req, res) => {

    // console.log(req.query);
    Blog.findOne({ _id: req.query.blogID }).then((data) => {

        res.render("blogPage", { blog: data });

    });

}

module.exports = {
    uploadBlog, getUpload, readAllBlogs,
    pMyBlogs, gMyBlogs, updateBlog, blogPage
};
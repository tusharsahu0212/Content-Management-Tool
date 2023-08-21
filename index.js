const express = require("express");
const mongoose = require('mongoose');
const multer = require("multer");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const fs = require('fs');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/bharatInternBlogDB');

}

let usernameSession = null;
let passwordSession = null;

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: Buffer,
        require: true
    },
    video: Buffer
});



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    blogs: {
        type: [blogSchema],
        default: []
    }

});

const Blog = mongoose.model('Blog', blogSchema);
const User = mongoose.model('User', userSchema);

const upload = multer({
    limits: 15 * 1024 * 1024
});

const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }])


// create
app.post('/upload', cpUpload, async (req, res) => {


    if(req.files['image'][0].size>15728640){
        return res.render('upload',{ALERT:true, message:"Image size may not larger than 15MB!"})
    }

    if(req.files['video']){
        if(req.files['video'][0].size>15728640){
            return res.render('upload',{ALERT:true, message:"Video size may not larger than 15MB!"})
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
    await User.findOne({ username: usernameSession, password: passwordSession }).then(async (data, err) => {

        if (err) {
            console.log(err);
            res.status(404);
        } else {
            prevblogs = data.blogs;
            prevblogs.push(newBlog);
        }

        User.updateOne({ username: usernameSession, password: passwordSession }, { blogs: prevblogs }).then((data, err) => {

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

        if(videoBuffer){
            fs.writeFileSync(`./public/media/video/${newBlog._id}.mp4`, videoBuffer, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error saving file' });
                }
    
    
            });
        }
  




        return res.redirect('/myBlogs');
    });





});

app.get('/upload', (req, res) => {

    if (usernameSession == null && passwordSession == null) {
        return res.render("login", { ALERT: false });
    }

    return res.render('upload',{ALERT:false});
});

//read
app.get('/', (req, res) => {

    Blog.find().then((data) => {

        res.render("home", { data: data });
    });

});

//My Blogs
app.post('/myBlogs', (req, res) => {


    User.findOne({ username: req.body.username }).then((data, err) => {

        // console.log(req.body)
        if (data) {
            res.status(200).send(data);
        } else {
            res.send(err);
        }

    });
});

app.get('/myBlogs', (req, res) => {

    if (usernameSession == null && passwordSession == null) {
        return res.render("login", { ALERT: false });
    }

    User.findOne({ username: usernameSession, password: passwordSession }).then((data, err) => {

        if (data) {

            return res.render('myBlogs', { data: data.blogs, username: usernameSession });


        } else {
            console.log(err);

        }

    });

});

// update
app.get('/update', cpUpload, async (req, res) => {

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


});



//signUp
app.post('/signUp', async (req, res) => {

    console.log(req.body);
    User.find({ username: req.body.username }).then(async (data, err) => {

        if (err) {
            res.render('signup', { ALERT: true });


        } else {
            const newUser = new User({

                username: req.body.username,
                password: req.body.password

            });

            await newUser.save();

            usernameSession = req.body.username;
            passwordSession = req.body.password;

            res.redirect('/myblogs');
        }

    });



});

//login
app.post('/login', (req, res) => {

    User.findOne({ username: req.body.username }).then((data, err) => {


        if (data) {

            if (data.password == req.body.password) {

                usernameSession = req.body.username;
                passwordSession = req.body.password;

                // res.render('myBlogs',{data:data.blogs});
                return res.redirect('/myBlogs')
            } else {
                return res.render('login', { message: "Incorrect Password!", ALERT: true });
            }
        } else {
            console.log(err);
            return res.render('login', { message: "User Not Found!", ALERT: true });

        }

    });

});

// logout User
app.get('/logout', (req, res) => {

    usernameSession = null;
    passwordSession = null;
    res.redirect('/');
});

// login page
app.get('/login', (req, res) => {

    res.render('login', { ALERT: false });
});

//signup page
app.get('/signUp', (req, res) => {

    res.render('signup', { ALERT: false });
});

//Blog Page
app.get('/blogPage',(req,res)=>{

    // console.log(req.query);
    Blog.findOne({_id:req.query.blogID}).then((data) => {

        res.render("blogPage", { blog:data });

    });

});

app.listen(3000, () => {
    console.log("Server started on port 3000.");
})
const multer = require("multer");
const {uploadBlog, getUpload, readAllBlogs, pMyBlogs, gMyBlogs, updateBlog, blogPage} = require("../controllers/blog.controller");

const upload = multer({
    limits: 15 * 1024 * 1024
});

const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }])

module.exports = (app) => {

    // create
    app.post('/upload', cpUpload, uploadBlog);

    app.get('/upload', getUpload);

    //read
    app.get('/', readAllBlogs);

    //My Blogs
    app.post('/myBlogs', pMyBlogs);

    app.get('/myBlogs', gMyBlogs);

    // update
    app.get('/update', cpUpload, updateBlog);

    //Blog Page
    app.get('/blogPage', blogPage);

};
const express = require("express");
const mongoose = require('mongoose');
const ejs = require("ejs");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const fs = require('fs');

const app = express();
require('dotenv').config()

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/bharatInternBlogDB');

}


require("./routes/user.route")(app)
require("./routes/blog.route")(app)

const PORT = 8000;
app.listen(PORT, () => {
    console.log("Server started on port", PORT);
})
//jshint esversion:6
import {createRequire} from "module";
const require = createRequire(import.meta.url);
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const path = require('path'); 
const domPurifier = require('dompurify');
const {JSDOM} = require('jsdom');
const htmlPurify = domPurifier(new JSDOM().window);
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const slug = require('mongoose-slug-generator');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { stripHtml } from "string-strip-html";

mongoose.connect("mongodb+srv://Yatcher_01:Jaguar123@new.nufxqpo.mongodb.net/blogDB", {useNewUrlParser:true});

mongoose.plugin(slug);
const postSchema = new mongoose.Schema({
 title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  snippet: {
    type: String,
  },
  class: {
    type: String,
    required: false,
  },
  slug: {
    type: String,
    slug: 'title',
    slug_padding_size: 2,
  },
});

postSchema.pre('validate', function(next){
  if(this.content){
    this.content = htmlPurify.sanitize(this.content);
    this.snippet = stripHtml(this.content.substring(0,200)).result;
  }
  next();
});

const Post = mongoose.model("Post", postSchema);

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));


let posts = [];

app.get("/", function(req, res){
  Post.find({}).then(function(posts){
    try {
      res.render("home", {
        startingContent: homeStartingContent,
        posts: posts
        });
    } catch (error) {
    console.log(error);      
    }
  });
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
    class: req.body.class
});

  post.save();
  posts.push(post);
  res.redirect("/");

});

app.get("/posts/:slug", function(req, res){
  const requestPostId = req.params.slug;
    Post.findOne({slug: requestPostId}).then(function(post){
          res.render("post", {
            id: post._id,
            title: post.title,
            content: post.content,
            post: post.class
          });
        });
});

app.get("/posts", function(req, res){
    Post.find({}).then((post)=>{
      try {
        if(post){
          res.render("posts", {postsFound: post});
        }
      } catch (error) {
        console.log(error);
      }
    });
});

// app.get("/postsdelete", function(req, res){
//     Post.deleteMany({}).then(()=>{
//       try {
//         return res.send("postsdeleted")
//       } catch (error) {
//         console.log(error);
//       }
//     });
// });

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/posts/edit/:id", function(req, res){
  const requestPostId = req.params.id;
    Post.findOne({_id: requestPostId}).then(function(post){
          res.render("editpost", {
            id: post._id,
            title: post.title,
            content: post.content,
            class: post.class
          });
        });
});

app.post("/storeedit/:id", async function(req, res){
  try{
    const filter = { _id: req.params.id };
    const update = {
    title: req.body.postTitleEdited,
    content: req.body.postBodyEdited,
    class: req.body.classEdited
   };
   await Post.findOneAndUpdate(filter, update);
    res.redirect("/");
  }catch(err){
    res.send(err);
  }
});

app.get("/posts/delete/:id", async function(req, res){
  try{
    const filter = { _id: req.params.id };
   await Post.findOneAndDelete(filter);
    res.redirect("/");
  }catch(err){
    res.send(err);
  }
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});

require('dotenv').config()
const express = require(`express`);
const bodyParser = require(`body-parser`);
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const mongoose = require('mongoose');
const multer  = require('multer')
const bcrypt = require("bcrypt")
const saltRounds =10;
var flag = false;
var flag2= false;
const port = 3000;



const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));
app.set(`view engine`,`ejs`)

// mongoDB
const url = process.env.MONGODB_URL;
mongoose.connect(url,{useNewUrlParser: true})
.then(()=> console.log("Connected!"));

const Schema = mongoose.Schema;
const PostSchema= new Schema({
    ImageUrl: String,
    Title: String,
    Post: String,
    Time: String
})
const Post = mongoose.model(`Post`,PostSchema);

const UserSchema = new Schema({
    userId: {type:String, unique: true},
    userPassword: String
})
const User = mongoose.model(`User`,UserSchema)
//

//connect to cloudinary 
cloudinary.config({
    secure: true
  });
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: (req, file) => 'blog-website',
    }
});
//

//multer 
const parser = multer({ 
    storage: storage,
    limits:{
        fileSize:5e+7
    }
});
//


app.get("/",(req,res)=>{
    Post.find()
    .then(function(posts){
        res.render("homepage",{title:"Homepage",post:posts});
    })
    
})

app.get("/compose",(req,res)=>{
    if(flag){
        res.render("compose",{title:"Compose",message:"You can upload photos"});
    }else{
        res.redirect("/alert2")
    }
})

app.post('/compose', (req, res, next) => {
    parser.single('avatar')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // Multer tarafından oluşturulan hata
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.render("compose", { title: "Compose", message: "File size exceeds the limit!" });
        }
        // Diğer Multer hataları için gerekli işlemler yapılabilir
      } else if (err) {
        // Diğer hatalar
        return res.render("compose", { title: "Compose", message: "An error occurred during file upload!" });
      }
      
    var image = req.file;
    if(!req.file){
        image = "";
    }
    const title = req.body.textTitle;
    const post = req.body.textPost;

    // image control
    if(image != ""){
        try{
            if(!image) throw new Error("oops");;
            if(!/^image/.test(image.mimetype)) throw new Error("oops");;
        }
        catch(error){
            return res.render("compose",{title:"Compose",message:"File type is not image or larger than 100 mb! FAİLED"});
        }
        
    }
    //
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const formattedDate = `${day}/${month}/${year}`

    // save to mongoDB
    const blogPost = new Post({
        ImageUrl:image.path,
        Title:title,
        Post:post,
        Time:formattedDate
    })

    blogPost.save()
    .then(() => {
        res.redirect("/");
    })
    .catch(err => {
        res.send(err)
    })
    })
})

app.get("/posts/:postID",(req,res)=>{
    const postID = req.params.postID;    
    Post.findById({_id:postID})
    .then(function(post){
        res.render("post",{title:post.Title,textTitle:post.Title,textPost:post.Post,image:post.ImageUrl,time:post.Time});
    })
})

app.get("/signin",(req,res) => {
    if(!flag){
        res.render("signin",{title:"Sign-in",message:"Welcome!"})
    }else{
        res.redirect("/alert")
    }
})

app.post("/signin",(req,res) => {
   
    const nickName = req.body.nickName;
    const password = req.body.password;
    const password2 = req.body.password2;
    //password encrypt
    if(password.length < 8){
        res.render("signin",{title:"Sign-in",message:"password length must be greater than 7!"})
    }else if(nickName.length < 4){
        res.render("signin",{title:"Sign-in",message:"username length must be greater than 3!"})
    }
    else{
        if(password===password2){ 
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                const user = new User({
                    userId: nickName,
                    userPassword: hash
                })
                user.save()
                .then(()=> {
                    flag2 = true;
                    res.render("signin",{title:"Sign-in",message:"You have successfully registered"})
                })
                .catch((err) =>{
                    res.render("signin",{title:"Sign-in",message:"Username already exist!"})
                }) 
            })
        }else{
            res.render("signin",{title:"Sign-in",message:"passwords doesn't match!"})
        }
    }
    
})

app.get("/login",(req,res)=>{
    if(!flag){
        res.render("login",{title:"Log-in",message:"Welcome!"})
    }else{
        res.redirect("/alert");
    }
})

app.post("/login",(req,res)=> {
    const nickName = req.body.nickName;
    const password = req.body.password;

    User.findOne({userId:nickName})
    .then((user)=>{
        bcrypt.compare(password,user.userPassword, (err, result) =>{
            if(result === true){
                flag = true;
                res.render("login",{title:"Log-in",message:"You have successfully loged in"})
            }else{
                res.render("login",{title:"Log-in",message:"password arent matched"})
            }
        });
    })
    .catch((err)=>{
        res.render("login",{title:"Log-in",message:"username is not registered"})
    })
})

app.get("/alert",(req,res)=>{
    res.render("alert",{title:"ALERT"});
})

app.post("/alert",(req,res)=>{
    flag = false;
    res.redirect("/signin")
})

app.get("/alert2",(req,res)=>{
    res.render("alert2",{title:"ALERT"});
})

app.post("/alert2",(req,res)=>{
    res.redirect("/login")
})

app.listen(port,()=>{
    console.log(`site listening on port ${port}`);
})
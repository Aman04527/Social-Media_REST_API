const express = require("express");
const connectDB = require("./database/db");
//creating an instance of express
const app = express()
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")
const authRoute = require("./routes/auth")
//load environment variable from '.env' file into object

const userRoute=require("./routes/users")
const postRoute=require("./routes/posts")
const commentRoute=require("./routes/comment")
const storyRoute = require("./routes/stories")
const conversationRoute = require("./routes/conversations")
const messageRoute = require("./routes/messages")
//adding path middleware
const path = require("path")
const {errorHandler} = require("./middlewares/error")
const verifyToken = require("./middlewares/verifyToken")


dotenv.config()

app.use(express.json())
//If you dont add line use express json you will get error undefined

app.use(cookieParser())

app.use("/uploads",express.static(path.join(__dirname,"uploads")))
app.use("/api/auth",authRoute)
app.use("/api/user",verifyToken,userRoute)
app.use("/api/post",verifyToken,postRoute)
app.use("/api/comment",verifyToken,commentRoute)
app.use("/api/story",verifyToken,storyRoute)
app.use("/api/conversation",verifyToken,conversationRoute)
app.use("/api/message",verifyToken,messageRoute)


app.use(errorHandler)

//Basics Of how REST API works
// app.get("/",(req , res) => {
//     res.send("Hello World , This is advance social media api")
// })

// const posts = [
//     {id:1 , title:"First Post",content:"This is first post content"},
//     {id:2 , title:"Second Post",content:"This is Second post content"},
// ]

// app.get("/posts" , (req,res)=>{
//     res.json(posts);
// })

// app.get("/posts/:id",(req,res)=>{
//     const postId = parseInt(req.params.id)
//     //req.params.id returns the string value of id parameter in URL Route 
//     //change the returned value to int 
//     const post = posts.find((p)=>p.id === postId)

//     if(!post)
//         return res.status(404).json({error:"Post Not Found!"})
    
//     res.send(post)
// })
  
// app.post("/posts",(req , res)=>{
//     const title = "new post"
//     const content = "This is new Post"
//     const newPost = {id:posts.length+1 , title , content}
//     posts.push(newPost)
//     //add to the array posts

//     res.status(201).json(newPost) 
// })

app.listen(5000, () => {
    connectDB()
    console.log("App is running");
})
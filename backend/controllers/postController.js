const { CustomError } = require("../middlewares/error")
const Post = require("../models/Post")
const User = require("../models/User")

//request ,response and next
const createPostController= async(req,res,next) => {
    //retreive the user id and caption from the require body
    //De-structuring the userId and caption from req.body
    const {userId,caption} = req.body
    try{
        const user = await User.findById(userId)
        if(!user){
            throw new CustomError("No User Found!",404)
        } 
        //Creating a new Post 
        const newPost = new Post({
            user:userId,
            caption
        })

        await newPost.save()
        user.posts.push(newPost._id)
        await user.save()
        res.status(201).json({message:"Post Created Successfully!",post:newPost})
    }
    catch(error){
        next(error)
    }
}

const generateFileUrl=(filename)=>{
    return process.env.URL+`/uploads/${filename}`
}

const createPostWithImagesController = async(req,res,next) => {
    const {userId} = req.params
    const {caption} = req.body
    const files = req.files
    try{
        const user = await User.findById(userId)
        if(!user){
            throw new CustomError("No User Found!",404)
        }
        //reterive imageURL array from  files and map them to generate url
        const imageurls = files.map(file => generateFileUrl(file.filename))
        const newPost = new Post({
            user:userId,
            caption,
            image:imageurls
        })

        await newPost.save()
        user.posts.push(newPost._id)
        await user.save()
        res.status(201).json({message:"Post Created Successfully!",post:newPost})
    }
    catch(error){
        next(error)
    }
}

const updatePostController = async(req,res,next) => {
    const {postId} = req.params
    const {caption} = req.body
    try{
        const postToUpdate = await Post.findById(postId)
        if(!postToUpdate){
            throw new CustomError("No Post Found!",404)
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            {caption},
            {new:true}
        );

        await updatedPost.save()
        res.status(200).json({message:"Post Updated Successfully!",post:updatedPost})

    }
    catch(error){
        next(error)
    }
}

const getPostController = async(req,res,next)=>{
    const {userId} = req.params
    try{
        const user = await User.findById(userId)
        if(!user){
            throw new CustomError("No User Found!",404)
        }

        const blockedUserIds = user.blocklist.map(id=>id.toString())
        //excluding all the blocked user and showing the information of the user like in facebook when you see someones posts
        const allPosts = await Post.find({user:{$nin:blockedUserIds}}).populate("user","username fullName profilePicture")

        res.status(200).json({posts:allPosts})
    }
    catch(error){
        next(error)
    }
}


const getUserPostsController = async(req,res,next)=>{
    const {userId} = req.params
    try{
        const user = await User.findById(userId)
        if(!user){
            throw new CustomError("No User Found!",404)
        }

        const userPost = await Post.find({user:userId})
        res.status(200).json({posts:userPost})
    }
    catch(error){
        next(error)
    }
}

//Whenever deleting we use filter to filter out deleting files
const deletePostController = async(req,res,next)=>{
    const {postId} = req.params
    try{
        const postToDelete = await Post.findById(postId)
        if(!postToDelete){
            throw new CustomError("No Post To Delete!",404)
        }
        const user =await User.findById(postToDelete.user)
        if(!user){
            throw new CustomError("No Post To Delete!",404)
        }
        user.posts = user.posts.filter(postId=>postId.toString() !== postToDelete._id.toString())
        await user.save()
        await postToDelete.deleteOne()

        res.status(200).json({message:"Post Deleted Successfully!"})
    }
    catch(error){
        next(error)
    }
}


const likePostController = async(req,res,next) => {
    const {postId} = req.params
    const {userId} = req.body
    try{
        const post = await Post.findById(postId)
        if(!post){
            throw new CustomError("No Such Post in the database!",404)
        }
        const user =await User.findById(userId)
        if(!user){
            throw new CustomError("User not found!",404)
        }
        if(post.likes.includes(userId)){
            throw new CustomError("Post Already Liked by the User",404)
        }
        post.likes.push(userId)
        await post.save()
        res.status(200).json({message:"Post Liked Successfully!",post})
    }
    catch(error){
        next(error)
    }
}

const dislikePostController = async(req,res,next) => {
    const {postId} = req.params
    const {userId} = req.body
    try{
        const post = await Post.findById(postId)
        if(!post){
            throw new CustomError("No Such Post in the Database!",404)
        }
        const user = await User.findById(userId)
        if(!user){
            throw new CustomError("User not found!",404)
        }
        if(!post.likes.includes(userId)){
            throw new CustomError("Post Already Not liked By the User",404)
        }
        post.likes = post.likes.filter(id=>id.toString() !== userId)
        await post.save()
        res.status(200).json({message:"Post Disliked Successfully!",post})
    }
    catch(error){
        next(error)
    }
}

module.exports = {createPostController,createPostWithImagesController,updatePostController,getPostController,getUserPostsController,deletePostController,likePostController,dislikePostController}
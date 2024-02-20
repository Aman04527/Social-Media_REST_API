const { CustomError } = require("../middlewares/error")
const Comment = require("../models/Comment")
const Post = require("../models/Post")
const User = require("../models/User")

const createCommentController = async(req,res,next) => {
    const {postId , userId , text}= req.body 
    try{
        const post = await Post.findById(postId)
        if(!post){
            throw new CustomError("Post Not Found",404)
        }
        const user = await User.findById(userId)
        if(!user){
            throw new CustomError("No Such User",404)
        }
        const newComment = new Comment({
            user:userId,
            post:postId,
            text,
        })

        await newComment.save()
        post.comments.push(newComment._id)
        await post.save()

        res.status(201).json({message:"Comment added to the post",comment:newComment})
    }
    catch(error){
        next(error)
    }
}

const createCommentReplyController = async(req,res,next) => {
    const {commentId} = req.params
    const {text, userId} = req.body
    try{
        const parentComment = await Comment.findById(commentId)
        if(!parentComment){
            throw new CustomError("Comment doesn't exists",404)
        }
        const user = await User.findById(userId)
        if(!user){
            throw new CustomError("User doesn't exists",404)
        }
        const newComment = {
            user:userId,
            text,
        }

        parentComment.replies.push(newComment)
        await parentComment.save()

        res.status(201).json({message:"Reply added to the comment",replies:newComment})
    }
    catch(error){
        next(error)
    }
}

const updateCommentController = async(req,res,next) => {
    const {commentId} = req.params
    const {text}= req.body
    try{
        const commentToUpdate = await Comment.findById(commentId)
        if(!commentToUpdate){
            throw new CustomError("No comment available",404)
        }
        const updateComment = await Comment.findByIdAndUpdate(commentId,
            {text},{new:true})
        
        res.status(200).json({message:"Comment Updated!",updateComment})
    }
    catch(error){
        next(error)
    }
}


const updateReplyCommentController = async(req,res,next) => {
    const {commentId,replyId} = req.params
    const {text} = req.body
    try {
        const parentComment = await Comment.findById(commentId)
        if(!parentComment){
            throw new CustomError("Comment doesn't exists",404)
        }
        const replyIndex = parentComment.replies.findIndex((reply)=>reply._id.toString() == replyId)
        if(replyIndex === -1){
            throw new CustomError("Reply Not Found!",404)
        }
        parentComment.replies[replyIndex].text = text
        await parentComment.save()
        req.status(200).json({message:"Replies Updated!",parentComment})
    } 
    catch (error) {
        next(error)
    }
}

//For getting the  user details of all the comment
const populateUserDetails = async(comments)=>{
    for(const comment of comments){
        await comment.populate("user","username fullname profilePicture")
        if(comment.replies.length > 0){
            await comment.populate("replies.user","username fullname profilePicture")
        }
    }   


}

const getCommentsByPostController = async(req,res,next)=>{
    const {postId} = req.params
    try{
        const post = await Post.findById(postId)
        if(!post){
            throw new CustomError("Post Not Found!",404)
        }
        //since the comments will be in an array so we return array
        let comments = await Comment.find({post:postId})

        await populateUserDetails(comments)

        res.status(201).json({comments})
    }
    catch(error){
        next(error)
    }
}


const deleteCommentController = async(req,res,next)=> {
    const {commentId} = req.params
    try{
        const comment = await Comment.findById(commentId)
        if(!comment){
            throw new CustomError("Comment not Found!",404)
        }
        
        await Post.findOneAndUpdate(
            {comments:commentId},
            {$pull:{comments:commentId}},
            {new:true}
        )

        await comment.deleteOne()

        res.status(200).json({message:"Comment Deleted Successfully!"})
    }
    catch(error){
        next(error)
    }
}

const deleteReplyCommentController = async(req,res,next)=>{
    const {commentId , replyId} = req.params
    try{
        const comment = await Comment.findById(commentId)
        if(!comment){
            throw new CustomError("Comment not found!",404)
        }

        comment.replies=comment.replies.filter(id=>{
            id.toString()!== replyId
        })

        await comment.save()
        res.status(200).json({message:"Reply Deleted Succesfully!"})

    }
    catch(error){
        next(error)
    }
}

const likeCommentController = async(req,res,next)=>{
    const {commentId} = req.params
    const {userId} = req.body
    try{
        const comment = await Comment.findById(commentId)
        if(!comment){
            throw new CustomError("Comment not found!",404)
        }
        const user = await User.findById(userId)
        if(!user){
            throw new CustomError("user not found!",404)
        }
        if(comment.likes.includes(userId)){
            throw new CustomError("You have already liked this comment",404)
        }
        comment.likes.push(userId)
        await comment.save()

        res.status(200).json({message:"Comment liked!",comment})
    }
    catch(error){
        next(error)
    }
}

const unlikeCommentController = async(req,res,next) => {
    const {commentId} = req.params
    const {userId} = req.body
    try{
        const comment = await Comment.findById(commentId)
        if(!comment){
            throw new CustomError("Comment not found!",404)
        }
        const user = await User.findById(userId)
        if(!user){
            throw new CustomError("user not found!",404)
        }
        if(!comment.likes.includes(userId)){
            throw new CustomError("You haven't liked this comment",404)
        }
        comment.likes=comment.likes.filter(id=>
            id.toString()!== userId
        )

        await comment.save()

        res.status(200).json({message:"Comment Disliked!",comment})
    }
    catch(error){
        next(error)
    }
}

const likeReplyController = async(req,res,next) => {
    const {commentId , replyId} = req.params
    const {userId} = req.body
    try{
        const comment = await Comment.findById(commentId)
        if(!comment){
            throw new CustomError("Comment not found!",404)
        }
        const replyComment = comment.replies.id(replyId)
        if(!replyComment){
            throw new CustomError("Reply comment not found!",404)
        }
        const user = await User.findById(userId)
        if(!user){
            throw new CustomError("user not found!",404)
        }
        if(replyComment.likes.includes(userId)){
            throw new CustomError("You have already liked this reply",404)
        }
        replyComment.likes.push(userId)
        await comment.save()

        res.status(200).json({message:"Reply liked!",replyComment})
    }
    catch(error){
        next(error)
    }
}

const dislikeReplyController = async(req,res,next) => {
    const {commentId , replyId} = req.params
    const {userId} = req.body
    try{
        const comment = await Comment.findById(commentId)
        if(!comment){
            throw new CustomError("Comment not found!",404)
        }
        const replyComment = comment.replies.id(replyId)
        if(!replyComment){
            throw new CustomError("Reply comment not found!",404)
        }
        const user = await User.findById(userId)
        if(!user){
            throw new CustomError("user not found!",404)
        }
        if(!replyComment.likes.includes(userId)){
            throw new CustomError("You haven't liked this reply",404)
        }
        replyComment.likes=replyComment.likes.filter(id=>
            id.toString()!== userId
        )

        await replyComment.save()

        res.status(200).json({message:"Reply liked!",replyComment})
    }
    catch(error){
        next(error)
    }
}

module.exports={createCommentController,createCommentReplyController,updateCommentController,updateReplyCommentController,getCommentsByPostController,deleteCommentController,deleteReplyCommentController,likeCommentController,unlikeCommentController,likeReplyController,dislikeReplyController}
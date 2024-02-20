const { CustomError } = require("../middlewares/error")
const User = require("../models/User")
const Post = require("../models/Post")
const Comment = require("../models/Comment")
const Story = require("../models/Story")

const getUserController = async (req,res,next) =>{
    //Return all the information about the user
    //get the userId from params i.e. URL
    const {userId} = req.params
    try{
        //Find the user
        const user = await User.findById(userId)
        if(!user){
            throw new CustomError("No User Found!",404)
        }
        //Get all the information of the user
        const {password,...data} = user
        res.status(200).json(data._doc)
    }
    catch(error){
        next(error)
    }

}

const updateUserController = async (req,res,next) => {
    //Update the user information
    //so this is a put protocol
    const {userId} = req.params

    //Data to be updated
    const updateData = req.body
    try{
        //Finding the user to update
        const userToUpdate = await User.findById(userId)
        if(!userToUpdate){
            throw new CustomError("No User Found to Update!",404)
        }
        
        //assign the object in place of the previous user
        Object.assign(userToUpdate,updateData)
        //save the new user infomation
        await userToUpdate.save()
        //show the output feedback
        res.status(200).json({message:"User Updated Successfully!",user:userToUpdate})
    }
    catch(error){
        next(error)
    }
}

const followUserController = async (req,res,next)=>{
    //To be followed User
    const {userId} = req.params
    //From which is the following is happening
    const {_id} = req.body
    try{
        if(userId === _id){
            throw new CustomError("You can not follow yourself",500)
        }

        const userToFollow = await User.findById(userId)
        const loggedInUser = await User.findById(_id)

        //for user not logged in or there's no body of that name to follow
        if(!userToFollow || !loggedInUser){
            throw new CustomError("User not found",404)
        }

        if(loggedInUser.following.includes(userId)){
            throw new CustomError("Already Following this user!",400)
        }

        loggedInUser.following.push(userId)
        userToFollow.followers.push(_id)

        await loggedInUser.save()
        await userToFollow.save()

        res.status(200).json({message:"Succesfully followed the user!"})
    }
    catch(error){
        next(error)
    }
}

const unfollowUserController = async (req,res,next) => {
    const {userId} = req.params
    const {_id} = req.body

    try{
        if(userId == _id){
            throw new CustomError("You can not unfollow yourself",500)
        }
        const userToUnfollow = await User.findById(userId)
        const loggedInUser = await User.findById(_id)

        if(!userToUnfollow || !loggedInUser){
            throw new CustomError("Invalid User",404)
        }

        if(!loggedInUser.following.includes(userId)){
            throw new CustomError("Already Unfollowing this user!",400)
        }

        //deleting the following user from owner 
        loggedInUser.following = loggedInUser.following.filter(id => id.toString() !== userId)
        //deleting the follower user from id
        userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== _id)

        await loggedInUser.save()
        await userToUnfollow.save()

        res.status(200).json({message:"Succesfully Unfollowed the user!"})
    }
    catch(error){
        next(error)
    }

}

const blockUserController = async(req,res,next)=>{
    const {userId} = req.params;
    const {_id} = req.body
    try{
        if(userId == _id){
            throw new CustomError("You cannot block yourself!",400)
        }
        const userToBlock = await User.findById(userId)
        const loggedInUser = await User.findById(_id);

        if(!userToBlock || !loggedInUser){
            throw new CustomError("Invalid User",404)
        }

        if(loggedInUser.blocklist.includes(userId)){
            throw new CustomError("This user is already blocked!",400)
        }
        //blocked the user from logged in user profile
        loggedInUser.blocklist.push(userId)

        //if the user is in following list of logged in user filter it out by unfollowing the user
        loggedInUser.following=loggedInUser.following.filter(id=>id.toString()!==userId)
        //if the logged in user is in followers list of user then filter it out by unfollowing the logged in user
        userToBlock.followers = userToBlock.followers.filter(id=>id.toString()!=_id)

        await loggedInUser.save()
        await userToBlock.save()

        res.status(200).json({message:"Successfully Blocked the user!"})

    }
    catch(error){
        next(error)
    }
}

const unblockUserController = async(req,res,next)=>{
    const {userId} = req.params;
    const {_id} = req.body
    try{
        if(userId == _id){
            throw new CustomError("You cannot unblock yourself!",400)
        }
        const userToUnblock = await User.findById(userId)
        const loggedInUser = await User.findById(_id);

        if(!userToUnblock || !loggedInUser){
            throw new CustomError("Invalid User",404)
        }

        if(!loggedInUser.blocklist.includes(userId)){
            throw new CustomError("This user is already unblocked!",400)
        }
        loggedInUser.blocklist=loggedInUser.blocklist.filter(id=>id.toString()!==userId)

        await loggedInUser.save()

        res.status(200).json({message:"Successfully Unblocked the user!"})

    }
    catch(error){
        next(error)
    }
}

const getBlockedUsersController = async(req,res,next)=>{
    const {userId} = req.params
    try{
        const user = await User.findById(userId).populate("blocklist","username fullName profilePicture")
        if(!user){
            throw new CustomError("No User Found!",404)
        }
        //returning the blocked list array
        const {blocklist,...data}=user

        res.status(200).json(blocklist)
    }
    catch(error){
        next(error)
    }
}

const deleteUserController = async(req,res,next) => {
    const {userId} = req.params

    try{
        const userToDelete = await User.findById(userId)

        if(!userToDelete){
            throw new CustomError("No User found!",404)
        }
        //Delete all the post of user
        await Post.deleteMany({user:userId})
        //Deleting all the comments of user
        await Post.deleteMany({"comments.user":userId})
        //Deleting all the replies of comments of user
        await Post.deleteMany({"comments.replies.user":userId})
        //Deleting all the comments of user in the database
        await Comment.deleteMany({user:userId})
        //delete User stories from the database
        await Story.deleteMany({user:userId})
        //delete all the likes from the databse 
        await Post.deleteMany({likes:userId},{$pull:{likes:userId}})
        
        //update all the users that these conditions are matched
        await User.updateMany(
            //removing the users id from the following of user
            {_id:{$in:userToDelete.following}},
            {$pull:{followers:userId}})

        //pulling away the likes from the comments
        await Comment.updateMany({},{$pull:{likes:userId}})
        await Comment.updateMany({"replies.likes":userId},{$pull:{likes:userId}})
        await Post.updateMany({},{$pull:{likes:userId}})

        const replyComments = await Comment.find({"replies.user":userId})
        
        await Promise.all(
            replyComments.map(async(comment)=>{
                comment.replies=comment.replies.filter((reply)=>reply.user.toString()!=userId)
                await Comment.save()
            })
        )

        await userToDelete.deleteOne()
        res.status(200).json({message:"Everything associated with user is deleted Successfully!"})
    }
    catch(error){
        next(error)
    }
}


const searchUserController = async(req,res,next)=>{
    const {query} = req.params
     
    try{
        //since it might give us array so we will use 
        const users = await User.find({
            $or:[
                //regex means regular expression
                {username:{$regex:new RegExp(query,'i')}},
                {fullName:{$regex:new RegExp(query,'i')}}
            ]
        })
        res.status(200).json({users})
    }
    catch(error){
        next(error)
    }
}

const generateFileUrl=(filename)=>{
    return process.env.URL+`/uploads/${filename}`
}


const uploadProfilePictureController = async(req,res,next)=>{
    const {userId} = req.params
    const {filename} = req.file
    try{
        const user = await User.findByIdAndUpdate(userId,{profilePicture:generateFileUrl(filename)},{new:true})
        if(!user){
            throw new CustomError("User not found!",404)
        }

        res.status(200).json({message:"Profile Picture Updated!",user})
    } 
    catch(error){
        next(error)
    }
}


const uploadcoverPictureController = async(req,res,next)=>{
    const {userId} = req.params
    const {filename} = req.file
    try{
        const user = await User.findByIdAndUpdate(userId,{coverPicture:generateFileUrl(filename)},{new:true})
        if(!user){
            throw new CustomError("User not found!",404)
        }

        res.status(200).json({message:"Cover Picture Updated!",user})
    } 
    catch(error){
        next(error)
    }
}

module.exports ={getUserController,updateUserController, followUserController,unfollowUserController,blockUserController,unblockUserController,getBlockedUsersController,deleteUserController,searchUserController,uploadProfilePictureController,uploadcoverPictureController}
const Story = require("../models/Story")
const User = require("../models/User")
const CustomError = require("../middlewares/error")

const createStoryController= async(req,res,next)=>{
    const {userId} = req.params
    const {text} = req.body
    try{
        let image=""
        if(req.file){
            image=process.env.URL+`/uploads/${req.file.filename}`
        }
        const newStory= new Story({
            user:userId,
            image,
            text
        })
        await newStory.save()
        res.status(200).json({message:"Story Created Succesfully!"})
    }
    catch(error){
        next(error)
    }
}

const getStoriesController = async(req,res,next) => {
    const {userId} = req.params
    try{
        const user = await User.findById(userId)
        if(!user){
            throw new CustomError("No User Detcheted!",404)
        }
        const followingUsers = user.following
        const stories = await Story.find({user:{$in:followingUsers}})
        .populate("user","fullName  username profilePicture")

        res.status(200).json(stories)
    }
    catch(error){
        next(error)
    }
}

const getUserStoryController = async(req,res,next)=>{
    const {userId} = req.params
    try{
        const stories = await Story.find({user:userId})
        .populate("user","fullName  username profilePicture")

        res.status(200).json(stories)
    }
    catch(error){
        next(error)
    }
}

const deleteStoryController = async(req,res,next) => {
    const {storyId} = req.params.storyId
    try{
        await Story.findByIdAndDelete(storyId)

        res.status(200).json({message:"Story has been deleted!"})
    }
    catch(error){
        next(error)
    }
}

const deleteAllStoriesController = async(req,res,next) => {
    const {userId} = req.params
    try{
        await Story.deleteMany({user:userId})

        res.status(200).json({message:"All stories has been deleted!"})
    }
    catch(error){
        next(error)
    }
}


module.exports={createStoryController,getStoriesController,getUserStoryController,deleteStoryController,deleteAllStoriesController}
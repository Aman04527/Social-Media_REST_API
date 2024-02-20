const { CustomError } = require("../middlewares/error");
const Conversation = require("../models/Conversation")
const Message = require("../models/Message")

const createNewConversationController = async(req,res,next) => {
    try{
        let newConversation;
        if(req.body.firstUser !== req.body.secondUser ){
            newConversation = new Conversation({
                participants:[req.body.firstUser , req.body.secondUser]
            })
        }
        else{
            throw new CustomError("Sender and Receiver can not be the same!",400)
        }
        const savedConversation = await newConversation.save()

        res.status(201).json(savedConversation)
    }
    catch(error){
        next(error)
    }
 }


const getConversationOfUserController = async(req,res,next)=>{
    try{
        const conversation = await Conversation.find({
            participants:{$in:[req.params.userId]}
        })
        res.status(200).json(conversation)
    }
    catch(error){
        next(error)
    }
}

const getTwoUsersConversations = async(req,res,next) => {
    try{
        const conversation = await Conversation.find({
            participants:{$all:[req.params.firstUserId,req.params.firstUserId]}
        })
        res.status(200).json(conversation)
    }
    catch(error){
        next(error)
    }
}


const deleteConversationController = async(req,res,next) => {
    const conversationId = req.params.conversationId
    try{
        await Conversation.deleteOne({_id:conversationId})
        await Message.deleteMany({conversationId:conversationId})

        res.status(200).json({messaage:"Conversation Deleted Successfully!"})
    }
    catch(error){
        next(error)
    }
}



 module.exports = {createNewConversationController,getConversationOfUserController,getTwoUsersConversations,deleteConversationController}
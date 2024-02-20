const express = require("express")
const { createNewConversationController,getConversationOfUserController,getTwoUsersConversations,deleteConversationController } = require("../controllers/conversationContoller")
const router = express.Router()

//NEW CONVERSATION
router.post("/create",createNewConversationController)

//GET CONVERSATION OF USER
router.get("/:userId",getConversationOfUserController)

//FIND TWO USERS CONVERSATIONS
router.get("/:firstUserId/:secondUserId",getTwoUsersConversations)

//DELETE CONVERSATION
router.delete("/delete/:conversationId",deleteConversationController)

module.exports = router
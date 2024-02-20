const express = require("express")
const { createCommentController,createCommentReplyController,updateCommentController,updateReplyCommentController,getCommentsByPostController,deleteCommentController,deleteReplyCommentController,likeCommentController,unlikeCommentController,likeReplyController,dislikeReplyController } = require("../controllers/commentController")
const router = express.Router()

//CREATE COMMENT
router.post("/create",createCommentController)

//CREATE COMMENT REPLY
router.post("/create/reply/:commentId",createCommentReplyController)

//UPDATE COMMENT
router.put("/update/:commentId",updateCommentController)

//UPDATE REPLY COMMENT
router.put("/update/:commentId/replies/:replyId",updateReplyCommentController)

//GET ALL POST COMMENTS
router.get("/post/:postId",getCommentsByPostController)

//DELETE A COMMENT
router.delete("/delete/:commentId",deleteCommentController)

//DELETE A REPLY COMMENT
router.delete("/delete/:commentId/replies/:replyId",deleteReplyCommentController)

//LIKE A COMMENT
router.post("/like/:commentId/",likeCommentController)

//DISLIKE A COMMENT
router.post("/dislike/:commentId/",unlikeCommentController)

//LIKE A REPLY COMMENT
router.post("/:commentId/replies/like/:replyId",likeReplyController)

//DISLIKE A REPLY COMMENT
router.post("/:commentId/replies/dislike/:replyId",dislikeReplyController)


module.exports = router
const express= require("express")
const { createStoryController , getStoriesController,getUserStoryController,deleteStoryController,deleteAllStoriesController } = require("../controllers/storyController")
const router = express.Router()
const upload = require("../middlewares/upload")

//Adding middleware images so that user can upload image in the story
//CREATE STORY ROUTE
router.post("/create/:userId" , upload.single("image"),createStoryController)

//GET ALL STORIES EXPECT FOR THE BLOCED ONES
router.get("/all/:userId",getStoriesController)

//GET USER STORIES .. FETCH ONLY USER STORIES
router.get("/user/:userId",getUserStoryController)

//DELETE A STORY
router.delete("/delete/:storyId",deleteStoryController)

//DELETE ALL STORIES
router.delete("/delete/stories/:userId",deleteAllStoriesController)

module.exports = router
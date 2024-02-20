const express = require("express")
const { getUserController , updateUserController, followUserController,unfollowUserController,blockUserController,unblockUserController,getBlockedUsersController,deleteUserController,searchUserController,uploadProfilePictureController,uploadcoverPictureController } = require("../controllers/userController")
const upload = require("../middlewares/upload")
const router = express.Router()

//GET USER
router.get("/:userId",getUserController)

//UPDATE USER
//update/userid is the url 
router.put("/update/:userId" ,updateUserController)

//FOLLOW USER
router.post("/follow/:userId",followUserController)

//UNFOLLOW USER
router.post("/unfollow/:userId",unfollowUserController)

//BLOCK USER
router.post("/block/:userId",blockUserController)

//UNBLOCK USER
router.post("/unblock/:userId",unblockUserController)

//GET BLOCKED USERS
router.get("/blocked/:userId",getBlockedUsersController)

//DELETE USER
router.delete("/delete/:userId",deleteUserController)

//SEARCH A USER
router.get("/search/:userId",searchUserController);

//UPDATE PROFILE PICTURE
//inside bracket url, fieldname,controller
router.put("/update-profile-picture/:userId",upload.single("profilePicture"),uploadProfilePictureController)


//UPDATE COVER PICTURE
router.put("/update-cover-picture/:userId",upload.single("coverPicture"),uploadcoverPictureController)


module.exports = router
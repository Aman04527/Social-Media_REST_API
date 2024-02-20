//Multer a middleware used for uploading files in nodejs with those built in expressJS
const multer = require("multer")
const path = require("path")

//disk storgae to store file in local storage , cb= callback
const storage = multer.diskStorage({
    destination:function(req,res,cb){
        cb(null,"uploads/")
    },
    filename:function(req,file,cb){
        //extname returns the extension of path 
        //get the image in form of jpg or pdf
        const ext = path.extname(file.originalname)
        //so that everyone have differnet name we use date
        cb(null,`${file.fieldname}-${Date.now()}${ext}`)
    }
})

const upload = multer({storage:storage})

module.exports=upload
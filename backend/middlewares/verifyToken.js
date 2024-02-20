//We will create verify token functions to check if the user is authenticate user or not . Check if jwt is valid and tokens aren't tempered with

const jwt = require("jsonwebtoken")
const CustomError = require("../middlewares/error")

const verifyToken = (req,res,next) => {
    //check the token from cookies
    const token = req.cookies.token
    if(!token){
        throw new CustomError("You are not authenticated!",401);
    }

    //verify if the secret key provided in the env file is same as the cookie or not
    jwt.verify(token , process.env.JWT_SECRET,async(err,data)=>{
        if(err){
            throw new CustomError("Token is not valid!",403)
        }
        req.userId = data._id
        next()
    })
}
module.exports = verifyToken
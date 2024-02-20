
const User = require("../models/User")

//encrypt our passwords
const bcrypt = require("bcrypt")

//Jwt-Token for authorizaton
const jwt = require("jsonwebtoken")
const { CustomError } = require("../middlewares/error")

const registerController = async (req,res ,next) => {
    try{
        // console.log(req.body);
        // const newUser = new User(req.body)
        // const savedUser = await newUser.save()
        // res.status(201).json(savedUser)
        const {password,username,email} = req.body

        //check if there is existing user or not
        const existingUser = await User.findOne({ $or: [{username} ,{email}]})

        if(existingUser){
            throw new CustomError("Username or Email already exists!",400)
        }

        //generates a salt using the genSalt()
        //  A salt is a random string of characters used to add complexity to the hashing process, making it more resistant to attacks like rainbow table attacks
        const salt = await bcrypt.genSalt(10)

        //hashes the password using the hashSync()
        //hashSync() function generates a hash synchronously 
        const hashedPassword = await bcrypt.hashSync(password, salt)

        const newUser = new User({...req.body,password:hashedPassword})
        const savedUser = await newUser.save()
        res.status(201).json(savedUser)

    }
    catch(error){
        next(error)
    }
}

const loginController = async (req,res,next) => {
    try{
        let user;
        //check the given information and check whether we can find the user using email and username
        if(req.body.email){
            user = await User.findOne({email:req.body.email})
        }
        else{
            user = await User.findOne({username:req.body.username})
        }

        //if we didn't find the user we return with the error
        if(!user){
            throw new CustomError("User not found!",401)
        }
        //else we start our operation
        
        //match the password
        const match = await bcrypt.compare(req.body.password,user.password)

        if(!match){
            throw new CustomError("Wrong Credentials!",401)
        }

        //find the debris token id
        // const token = jwt.sign({_id:user._id} ,"adsfsdf",{expiresIn:"3d"})
        // console.log(token);
        // res.status(200).json(user)

        //using jwtToken for authhorization
        const {password,...data} = user._doc
        const token = jwt.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRE})

        //show the toke  in cookies
        res.cookie("token",token).status(200).json(data)

    }
    catch(error){
        next(error)
    }
}

const logoutController= async(req,res,next) => {
    try{
        //enable cookie to be sent to cross origin request , will be sent over http connection only. so connection will be secure
        res.clearCookie("token",{sameSite:"none",secure:true}).status(200).json("User logged succesfully")
    }
    catch(error){
        next(error)
    }
}

const refetchUserController = async(req,res,next) =>{
    //refetch the data from cookie 
    const token = req.cookies.token
    jwt.verify(token,process.env.JWT_SECRET, {} , async(err,data)=>{
        if(err){
            throw new CustomError(err,404)
        }
        try{
            const id = data._id
            const user = await User.findOne({_id:id})
            res.status(200).json(user)
        }
        catch(error){
            next(error)
        }
    })
}

module.exports={registerController,loginController,logoutController,refetchUserController}
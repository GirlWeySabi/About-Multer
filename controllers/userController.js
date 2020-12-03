const connection = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const passport = require('passport');
const multerConfig = require('../config/multer');
const multer = require('multer');
// const jwtStrategy = require('passport-jwt').Strategy;


const register = async (req, res)=>{

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const data = req.body;

    data.password = hash; //ARE THESE TWO NOT THE SAME??

   await connection.User.create(
        data        
    )

    res.json("registration successfully");

}
const login = async (req, res)=>{

    const email = req.body.email;
    const password = req.body.password;  //ARE THESE TWO NOT THE SAME?? meaning const password = hash
    // const data = req.body;

  const user = await connection.User.findOne({
       where:{
           email : email
        }
       });
    const showUser = await connection.User.findOne(
        {
            where: {
                email : email
            },
            attributes: { exclude: ['id','password','createdAt','updatedAt'] } 
        }
    );
       
    //    attributes : ['firstName','lastName','email']
    

   if (!user){
     return  res.json("you have to regiter first");
    }
    
    const checkPassword = bcrypt.compareSync(password, user.password); //what is checkpassword doing exactly?
    if (!checkPassword){
        return  res.json("your password is incorrect");
    } else {
        const payload = {
            id:user.id,
           }  
           const token = jwt.sign(payload, 'myVerySecret')
           res.json({
               "token" : token,
               "msg" : "login successfull",
               "user" : showUser,
               "statusCode" : 200
           });
        }
    
   
}

const getAllUsers = async (req, res)=>{
  const data = await connection.User.findAll();
    res.json(data);

}

const getOneUser = async (req, res)=>{
    const data = await connection.User.findOne({where: {id:req.user.id}});
      res.json(data);
  
  }



  const updateUser = async (req, res) => {

    await connection.User.update(req.body, {
        where: {
            id: req.user.id
        }
    });
    console.log('update successful');
    res.json('update successful')

}

// const destroy = async (req, res) => {
//     const inputId = req.params.id;  //Is it possible to do "req.params.courseTitle" instead of using id in this case (YES, JUST use courseTitle in the route, instead of "id")
//     await db.CourseModel.destroy({
//         where : {
//             id : inputId

//     }
// })


// console.log('course deleted successfully');
// res.json('course deleted successfully');

// }






  async function uploadProfilePicture(req, res){
      multerConfig.singleUpload(req, res, async function(err){
          if(err instanceof multer.MulterError){
              return res.json(err.message);
          }
          else if(err){
              return res.json(err);
          }
          else if (!req.file){
              return res.json({"image": req.file, "msg": 'please select an image to upload'});
          }
          if(req.file){
              await connection.User.update({profilePicture: req.file.path}, {where:{id:req.user.id}});
              return res.json({
                  'msg' : 'uploaded',
                  'file' : req.file
              });
          }

        })

    }
  

module.exports = {
    register,
    getAllUsers,
    login,
    getOneUser,
    uploadProfilePicture,
    updateUser
    
    // loginWithPassport       
}
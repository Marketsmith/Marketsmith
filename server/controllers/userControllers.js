const { User } = require('../models/usersModel');
const { Item } = require('../models/usersModel');
const path = require('path');
const bcrypt = require('bcryptjs');

const cloudinary = require('cloudinary').v2;
cloudinary.config({ 
  cloud_name: 'dlxfkrk48', 
  api_key: '374659647111771', 
  api_secret: 'd_3n7CUCzkxNfibszUer0UrxR2Y', 
  secure: true
});

const itemController = {};
const userController = {};


userController.login = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next({
      log: 'props not passed into userController.login',
      message: 'props not passed into userController.login'
    });
  }

  let loggedIn;

  User.findOne({ username })
    .then(data => {
      if (data) {
        res.locals.user = data;
        bcrypt
          .compare(password, res.locals.user.password)
          .then(result => {
            if (result) res.locals.success = true;
            return next();
          })
          .catch(err => {
            return next({
              err,
              log: 'userController.login: bcrypt error',
              message: 'userController.login: bcrypt error'
            });
          });
      }
      else return next();
    })
    .catch(err => {
      return next({
        err,
        message: 'login failed: error in userController.login',
        log: 'login failed: error in userController.login'
      });
    });
};

userController.signUp = (req, res, next) => {
  const { username, password } = req.body;

  res.locals.success = true;

  if (!username || !password) {
    res.locals.success = false;
    return next({
      log: 'props not passed into userController.signUp',
      message: 'props not passed into userController.signUp'
    });
  }

  User.findOne({ username })
    .then(data => {
      if (data) {
        res.locals.success = false;
        res.locals.exists = true;
        return next({
          log: 'username already exists, userController.signUp failed',
          message: 'username already exists, userController.signUp failed'
        });
      }
    })
    .catch(err => {
      res.locals.success = false;
      return next({
        err,
        message: 'signup failed: error in finding username in userController.signUp',
        log: 'signup failed: error in finding username in userController.signUp'
      });
    });

  if (res.locals.success) {
    User.create({ username, password })
      .then(data => {
        console.log(data);
        res.locals.user = data;
        res.locals.success = true;
        console.log(`User ${username} successfully created!`);
        return next();
      })
      .catch(err => {
        res.locals.success = false;
        return next({
          err,
          message: 'signup failed: error creating account in userController.signUp',
          log: 'signup failed: error creating account in userController.signUp'
        });
      });
  }

};

itemController.createItemListing = (req, res, next) => {
  const { user, name, date, description, category, city, picture} = req.body;
  const newItem = {
    user,
    name,
    date,
    description,
    category,
    city,
    picture,
  }
  console.log('the request body is');
  console.log(newItem)
  Item.create(newItem)
    .then((info)=>{
      return next();
    })
    .catch((err) => {
      console.error(err);
      return next({
        status: 400,
        log: 'createItemListing did not work',
        message: 'could not post item',
      });
    });
}



itemController.uploadImage = (req, res, next) => {
  console.log(req.body);
  const { title, desc, image } = req.body;

  
  console.log(title, desc);
  console.log(image);

  return next();

  // const uploadImage = async (imagePath) => {

  //   // Use the uploaded file's name as the asset's public ID and 
  //   // allow overwriting the asset with new versions
  //   const options = {
  //     use_filename: true,
  //     unique_filename: false,
  //     overwrite: true,
  //   };

  //   try {
  //     // Upload the image
  //     const result = await cloudinary.uploader.upload(imagePath, options);
  //     console.log(result);
  //     return result.public_id;
  //   } catch (error) {
  //     console.error(error);
  //   }
  
  // };

  // uploadImage(image)
  //   .then(response => {
  //     return next()
  //   });
  

};

userController.getListings = async (req,res,next) => {
  let username;
  username = readfile(username)
  try {
    const listingInfo = await User.findOne({username}).populate('items')
    res.locals.listing = listingInfo;
    return next()
  }
  catch {
    return next({
      status: 400,
      log: 'getListings did not work',
      message: 'could not display listings',
    });
  }

}



module.exports = {
  userController,
  itemController
};
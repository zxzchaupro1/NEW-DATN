const { response } = require('express');
const express = require('express');
const apiController = require('../controllers/apiController');
const midleware = require('../midlewares/middleware') 
const upload = require('../midlewares/multer')
const router = express.Router();


// api login
router.post('/login',apiController.loginVarification);

// api sign up
router.post('/signup',apiController.userSignup);
// api edituser
router.post('/editUser/:id',apiController.editUser);

// api verifyOTP
router.post('/verifyotp',apiController.verifyOTP);

// api books
router.get('/getbooks',apiController.renderBook);
router.get('/getbookdetails/:id',apiController.bookDetails);

// api user point
router.post('/addpoint',apiController.addPoint);
module.exports=router;
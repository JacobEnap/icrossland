const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/user-model");




/*************************************
 ROUTES FOR TESTING PURPOSES
**************************************/

router.route("/users").get((req,res) => {
  res.send("Hello you!");
})

router.get("/public", function (req, res) {
  res.json({
    message: "Hello from a public endpoint! You don't need to be authenticated to see this."
  });
});

router.get("/private", function (req, res) {
  res.json({
    message: "Hello from a private endpoint! You need to be authenticated and have a scope of read:messages to see this."
  });
});



/*************************************
ACTUAL ROUTES
**************************************/
router.get("/allusers", function(req, res) {
  User.find({}, function(error, users){
    if(error){
      console.log("problem finding data");
      res.send("something went really wrong!!!");
      next();
    } 
    // console.log(users);
    res.json(users);
  });
})

router.route('/:id')
	.get((req, res) => {
		User.findById(req.params.id)
			.then(user => {
				if (user) {
					return res.json(user);
				} else {
					return res.status(404).json({ msg: 'User not found'})
				}
			})
			.catch(err => console.log(err))
})


router.post("/user", function(req,res) {
  User.findOne({authId: req.body.sub}).then((currentUser) => {
    if (currentUser) {
      // already have user
      console.log("User is already register");
      console.log("User is ", currentUser);
    } else {
      // if not, create user in our db
      User.create({
        authId: req.body.sub,
        username: req.body.name,
        email: req.body.email,
        thumbnailFile: req.body.picture
      }, function(error, data){
        if(error){
          console.log("There was a problem adding a document to the collection.");
          console.log(error);
          res.sendStatus(500)
        } else {
          console.log("Data added to collection: ");
          console.log(data);
          res.sendStatus(200)
        }
      })
    }
  })
});


module.exports = router;
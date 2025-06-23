const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const User = require('./models/User');
const Exercise = require('./models/Exercise');
const { json } = require('express/lib/response');

require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users", async function(req, res){
  if (!req.body.username) {
    return res.json({"message": "username is required"});
  }
  else {
    user = await User.findOne({username: req.body.username});
    if (user) {
      return res.json({username: user.username, _id: user._id});
    }
    else {
      newUser = new User({username: req.body.username})
      await newUser.save();
      return res.json({username: newUser.username, _id: newUser._id});
    }
  }
})

app.get("/api/users", async function(req, res){
  let users = await User.find({});
  return res.json(users);
})

app.post("/api/users/:_id/exercises", async function(req, res){
  try {
    let user = await User.findOne({_id: req.params._id});
    
    let newExcersise = new Exercise({
      userId: user._id,
      duration: req.body.duration,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      description: req.body.description
    })
    await newExcersise.save();
    
    return res.json({          
        username: user.username,        
        description: newExcersise.description,       
        duration: newExcersise.duration,
        date: newExcersise.date.toDateString(),
        _id: user._id
    });
  }
  catch (err) {
    console.error(err);
    return res.json(err);
  }
})

app.get("/api/users/:_id/logs", async function(req, res){
  try { 
    let user = await User.findById(req.params._id);
    //let exercisesCount = await Exercise.countDocuments({userId: req.params._id});
    let exercisesQuery = Exercise.find({userId: req.params._id});
    if (req.query.from) {
      exercisesQuery.find({date: {$gte: new Date(req.query.from)}});
    }
    if (req.query.to) {
      exercisesQuery.find({date: {$lte: new Date(req.query.to)}});
    }
    if (req.query.limit) {
      exercisesQuery.limit(Number(req.query.limit));
    }
    let exercises = await exercisesQuery;
    
    let exercisesCount = exercises.length;
    return res.json({
      username: user.username,
      count: exercisesCount,
      _id: user._id,
      log: exercises.map((exercise) => {
        return {
          description: exercise.description,
          duration: exercise.duration,
          date: exercise.date.toDateString()
        }
      })
    })

  } catch (err) {
    console.error(err);
    res.json(err);
  }


})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

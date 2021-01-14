const express = require('express')
var path = require('path');
const url = require('url');
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
const { station } = require('./schema');
mongoose.connect('mongodb+srv://dsti_code:dsti_code@dsti.cabff.mongodb.net/stations?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true })
  .then((con) => {
    console.log('connected to db')
  }).catch(err => console.log('error'))
const app = express();
const port = process.env.PORT || 8000;
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//setup public folder
app.use(express.static('./Public'));
app.get('/', function (req, res) {
  res.render('index.ejs')
});

 

app.post('/add', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  const stations = new station(req.body)
  stations.save((err, info) => {
    if (info) {
      res.status(200).end(JSON.stringify(info))
    } else {
      res.status(400).send(JSON.stringify('err'))
    }
  })
}).get('/init', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  station.find({}, (err, data) => {
    if (data) {
      res.end(JSON.stringify(data))
    }
  })
}).get('/edit', function (req, res) {
  const queryObj = url.parse(req.url, true).query;
  station.findOne({ _id: queryObj.id }, (err, data) => {
    if (data) {
      res.render('edit', { obj: data });
    }
  })
}).post('/saveedit', function (req, res) { 
  res.setHeader('Content-Type', 'application/json')
  station.findOneAndDelete({ _id: req.body._id }, (err, data) => { 
    if (data) {
    if (req.body.location) {
      data = { type: data.type, capacity: data.capacity, location: req.body.location }
    } else {
      data = { type: req.body.type, capacity: req.body.capacity, location: data.location }
    }
    
      const stations = new station(data)
      stations.save((err, info) => {
        if (info) {
          const r = req.body.location ? {...info,p:req.body._id} : `success`
          res.status(200).end(JSON.stringify(r))
        } else {
          res.status(400).send(JSON.stringify(`err`))
        }
      })
    }
  })
})
  .delete('/deleter', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    station.findOneAndDelete({ _id: req.body.id }, (err, data) => {
      if (data) {
        res.status(200).end(JSON.stringify(data._id))
      } else {
        res.status(200).end(JSON.stringify(`err`))
      }
    })
  })
app.listen(port, () => console.log(`connected on port: ${port}!`));
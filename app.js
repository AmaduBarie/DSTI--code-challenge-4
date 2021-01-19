const express = require('express')
var path = require('path');
const url = require('url');
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
const { station,count } = require('./schema');
 
let ids = 1


// connect to my cloud server
mongoose.connect('mongodb+srv://dsti_code:dsti_code@dsti.cabff.mongodb.net/stations?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true })
.then((con) => {
  count.findOne({_id:1},(e,d)=>{
    if(d){
   console.log(d.count)
    }else{
      const c = new count({_id:1,count:1})  
      c.save()
    }  
  })
    console.log('connected to db')
  }).catch(err => console.log('error'))


// for local connection
// mongoose.connect('mongodb://localhost:27017/Chatmarket', { useUnifiedTopology: true, useNewUrlParser: true }).then((con) => {
//   console.log('connected')
// }).catch(err => console.log('error'))


 



 
 

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
 
  if(req.body.type){
    const type = req.body.type.split(" ")    
    if(type.length>1){
      req.body.type = `${type[0].slice(0,1).toUpperCase()}${type[0].slice(1).toLowerCase()} ${type[1].slice(0,1).toUpperCase()}${type[1].slice(1).toLowerCase()}`
    }else{
      req.body.type = `${type[0].slice(0,1).toUpperCase()}${type[0].slice(1).toLowerCase()}`    
    } 
  }

  count.findOne({_id:1},(e,d)=>{
    if(d){
      req.body._id =req.body._id|| d.count+1
    const stations = new station(req.body)
  
  stations.save((err, info) => {  
   count.updateOne({_id:1},{count:d.count+1},(e,r)=>console.log(e))
    if (info) {      
     return res.status(200).end(JSON.stringify(info))
    } else {
     return res.status(400).send(JSON.stringify(err.message))
    }
  })
    }  
  })
  
  
}).get('/edit', function (req, res) {
  const queryObj = url.parse(req.url, true).query;
  station.findOne({ _id: queryObj.id }, (err, data) => {
    if (data) {
      res.render('edit', { obj: data });
    }else{
      res.end("invalid input")
    }
  })
  
}).put('/saveedit', function (req, res) { 
 
  res.setHeader('Content-Type', 'application/json')
  if(req.body.type){
    const type = req.body.type.split(" ")    
    if(type.length>1){
      req.body.type = `${type[0].slice(0,1).toUpperCase()}${type[0].slice(1).toLowerCase()} ${type[1].slice(0,1).toUpperCase()}${type[1].slice(1).toLowerCase()}`
    }else{
      req.body.type = `${type[0].slice(0,1).toUpperCase()}${type[0].slice(1).toLowerCase()}`    
    } 
  }
  station.findOneAndDelete({_id:req.body._id}, (err, data) => { 
    console.log(err)
    if (data) {     
      data = {_id:data._id, type: req.body.type||data.type, capacity: req.body.capacity||data.capacity, location: req.body.location||data.location }
      const stations = new station(data)      
      stations.save((err, info) => {
        if (info) {
          res.status(200).end(JSON.stringify(info))
        } else {
          return res.status(400).send(JSON.stringify(err.message))
        }
      })
    }else{
      return res.status(400).send(JSON.stringify("invalid input"))
    }
  })
})
  .delete('/deleter', function (req, res) {      
        res.setHeader('Content-Type', 'application/json')
    station.findOneAndDelete({_id: req.body._id}, (err, data) => {
      if (data) {
        res.status(200).end(JSON.stringify(data))
      } else {
        res.status(200).end(JSON.stringify(`can't find id`))
      }
    })
    
  })
  // this api can help to filter by  
  // - ID number
  // - Location  
  // - Type  
  // - Capcity
  .get('/read', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    if(req.body.type){
      const type = req.body.type.split(" ")      
      if(type.length>1){
        req.body.type = `${type[0].slice(0,1).toUpperCase()}${type[0].slice(1).toLowerCase()} ${type[1].slice(0,1).toUpperCase()}${type[1].slice(1).toLowerCase()}`
      }else{
        req.body.type = `${type[0].slice(0,1).toUpperCase()}${type[0].slice(1).toLowerCase()}`    
      } 
    } 
    station.find(req.body, (err, data) => {
      if (data) {
        res.end(JSON.stringify(data))
      }else{
        res.end(JSON.stringify("err"))
      }
    })
  })
app.listen(port, () => console.log(`connected on port: ${port}!`));
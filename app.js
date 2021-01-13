 const express = require('express')
var path = require('path');
const url = require('url');
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
const {station} = require('./schema');

mongoose.connect('mongodb://localhost:27017/Chatmarket', { useUnifiedTopology: true, useNewUrlParser: true })

.then((con) => {
  console.log('connected')
}).catch(err => console.log('error'))



const app = express();
const port = 8000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//setup public folder
app.use(express.static('./images'));
app.get('/',function (req, res) {    
res.render('index.ejs')
});

 
// station.find({},(e,o)=> console.log(o))
// station.deleteMany({},(e,o)=> console.log(o))


app.post('/add',function (req, res) {   
    res.setHeader('Content-Type','application/json') 
    const stations = new station(req.body)
    stations.save((err, info) => {
      console.log(info)
        if (info) {
          res.status(200).end(JSON.stringify(`success`))
        } else {
          res.status(400).send(JSON.stringify(`success`))
        }
      })
}).get('/init',function (req, res) {   
    res.setHeader('Content-Type', 'application/json')
    station.find({},(err,data)=>{
      if(data){
        res.end(JSON.stringify(data))
      }
    })}).get('/edit',function (req, res) {   
      const queryObj = url.parse(req.url,true).query;
    station.find({_id:queryObj.id},(err,data)=>{
      if(data){
        console.log(data)
        res.render('edit', {obj:data[0]});
      }
    })
}).post('/saveedit',function (req, res) {  
  res.setHeader('Content-Type','application/json') 
    station.find({_id:req.body.id},(err,data)=>{
      console.log(req.body)
      console.log(data)
      if(data[0]){
        data[0].type = req.body.type
        data[0].capacity = req.body.capacity
        const stations = new station(data[0])
    stations.save((err, info) => {
      console.log(err)
        if (info) {
          res.status(200).end(JSON.stringify(`success`))
        } else {
          res.status(400).send(JSON.stringify(`err`))
        }
      })         
      }
    })
})



app.listen(port, () => console.log(`port ${port}!`));
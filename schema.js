const mongoose = require('mongoose');
 

// stations schema
const loc = new mongoose.Schema({
  lat: { type:Number, required: true } ,
  lng: { type:Number, required: true }
});
 
const stations =new mongoose.Schema({  
  _id: { type:Number, required: true },
  location: { type: loc, required: true},
  type: { type: String, enum: ['Pump Station', 'Dam', 'Community Pump', 'Well'], required: true},
  capacity: { type: Number, min:1,    required: true}
});


const counts =new mongoose.Schema({  
  _id: { type:Number, required: false,default:1 } ,
  count: { type:Number, required: true,default:1 } 
});






const station = mongoose.model('stations', stations);
const count = mongoose.model('counts', counts);
module.exports = {station,count}

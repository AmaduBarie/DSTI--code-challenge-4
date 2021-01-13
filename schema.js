const mongoose = require('mongoose');
 

// stations schema
const stations =new mongoose.Schema({ 
  location: { type: Object, required: true },
  type: { type: String,required: true  },
  capacity: { type: String,required: true  }
});

const station = mongoose.model('stations', stations);

module.exports = {station}

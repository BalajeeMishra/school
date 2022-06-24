
const mongoose = require("mongoose");
const ImageSchema = new mongoose.Schema({
  url: String,
  filename: String
});
const DetailSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true
},
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
},
classofs:{
    type:String,
    required:true
},
   age : {
        type: String,
        required:true
    },
   gender : {
     type : String,
     required:true
    } ,
    birthday: {
     type : Date,
     required:true
    } ,
    address:{
      type:String
    },
    mobno:{
     type:String,
     required:true
 },
 images: ImageSchema,
 resultShow:{
  type:Boolean,
  default:false
},

});
const Detail = mongoose.model('Detail', DetailSchema);
module.exports = Detail;
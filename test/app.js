var express = require("express");
var app = express();
const fileUpload = require('express-fileupload');
//npm install ejs, express, express-fileupload

//middleware
app.use(express.static(__dirname));
app.set('view engine', 'ejs');
app.use(fileUpload());

app.get('/inputFile', function(req, res){
  res.render('inputt');
});

app.post('/upload', function(req, res) {
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
   var startup_image = req.files.foo;
   var fileName = req.body.fileName;
   // Use the mv() method to place the file somewhere on your server
   startup_image.mv(__dirname + '/images/' + fileName + '.jpg');
 });

app.listen(8000);
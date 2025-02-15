// data.js (-download) (-upload)
/**

-download updates local files
-upload uploads files to the database

**/

var dbFileList = [
  'causeList.js',
  'causeList.json'
];

var _ = require('lodash');
var fs = require('fs');

// heroku config:get MONGODB_URI

var mongoURL = 'mongodb://heroku_xssg0zn9:7b4oc9upfgmv4hnid8sp15m8qg@ds337418.mlab.com:37418/heroku_xssg0zn9';
var mongoose = require('mongoose');
mongoose.connect(mongoURL);
var threshold = 0;
var checkDone = function() {
  if (threshold == 0) {
    process.exit();
  }
}

var File = mongoose.model('File', mongoose.Schema({
  name: String,
  content: String
}));

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to the db!');
  if (process.argv[2] == '-download') {
    File.find({}, function(err, files) {
      if (files == null) {
        console.log(err);
        debugger;
      }
      files.map(function(file) {
        if (dbFileList.indexOf(file.name) == -1) return;
        console.log(file.name);
        fs.writeFileSync('./data/' + file.name, file.content);
      });
      process.exit();
    });
  } else if (process.argv[2] == '-upload') {
    File.remove({}, function() {      
      threshold = dbFileList.length;
      _.forEach(dbFileList, function(fileName) {
        fs.readFile('./data/' + fileName, function(err, data) {
          console.log('Got', fileName);
          File.findOneAndUpdate({name: fileName}, {
            name: fileName,
            content: data
          }, {upsert:true}, function(err, doc){
            if (err) console.log('err', err);
            console.log('Uploaded ', fileName);
            threshold--;
            checkDone();
          });
        });
      });
    });
  } else {
    checkDone();
  }
});


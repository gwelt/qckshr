const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const path = require('path');
const MB=1024*1024;
const maxDBsize=150*MB;
const maxFilesize=100*MB;
var config = require('./config.json'); config=config||{};
var PORT = config.PORT||3000;
const Hook = require('./hook.js');
var hook = new Hook(config);

app.use(fileUpload({limits:{fileSize:maxFilesize+1}}));
app.use('(/qckshr)?/', express.static(__dirname + '/public'));
app.post('(/qckshr)?/', function(req, res) {res.send(addFile(req))});
app.use('(/qckshr)?/info', function(req, res) {let filelist=files.map((f)=>{return getObjWithoutData(f)}); res.send({maxFilesize:maxFilesize,socket_server_URL:config.socket_server_URL,qckshr_rooms:config.qckshr_rooms,filelist:filelist}); });
app.use('(/qckshr)?/EMP', function(req, res) {files=[]; res.send('EMP succeeded!')})
app.use('(/qckshr)?/delete/:id', function(req, res) {let f=findFile(req.params.id); if (f) {deleteFile(f.md5); res.send('OK')} else {res.status(404).send('File not found');}})
app.use('(/qckshr)?/:id', function(req, res) {
  let f=findFile(req.params.id);
  if (f) {
    res.set('Content-disposition', 'attachment; filename=' + f.name);
    res.set('Content-Type', f.mimetype);
    res.send(f.data);
    deleteFile(f.md5);
    hook.trigger('[QCKSHR] DOWNLOAD',f);
  } else {res.status(404).send('File not found');}
})
app.listen(PORT, function() {console.log('QCKSHR* listening on port '+PORT)});

var files = [];
function addFile(req) {
  if (req.files && Object.keys(req.files).length>0) {
    if (req.files.file.size<=maxFilesize) {
      deleteFile(req.files.file.md5);
      req.files.file.time=new Date().getTime();
      files.push(req.files.file);
      while (getSize()>maxDBsize) {files.shift()}
      hook.trigger('[QCKSHR] UPLOAD',req.files.file);
      return getObjWithoutData(req.files.file);
    } else {return {error:'Filesize must not exceed '+(maxFilesize/MB).toFixed(2)+' MB!'}}
  } else {return {error:'NO FILE. NO UPLOAD.'}}
}
function findFile(md5) {return files.find((f)=>{return f.md5==md5})}
function deleteFile(md5) {let file=files.find((f)=>{return f.md5==md5}); if (file) {files=files.filter((f)=>{return f.md5!==md5}); hook.trigger('[QCKSHR] DELETE',file);}}
function getObjWithoutData(o) {return {name:o.name,size:o.size,mimetype:o.mimetype,md5:o.md5,idle:new Date().getTime()-o.time}}
function getSize() {return files.reduce((a,c)=>{return a+c.size},0)}

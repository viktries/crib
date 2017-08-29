'use strict'
var express = require('express')
var MongoClient = require('mongodb').MongoClient
var assert = require('assert')
var bodyParser = require('body-parser')
var path = require("path")
var app = express()
var router = express.Router()
var csv=require('csvtojson')
var child = require('child_process')

var port = process.env.API_PORT || 3001
var mongoDBUrl = 'mongodb://life:life@ds159747.mlab.com:59747/life'

var SKLearn = function(module, estimator, methods, cb){
  cb = cb || function(){}
  var arg = JSON.stringify([module, estimator, methods])
  var python = child.spawn(
      'python', [__dirname + '/lib/exec.py', arg])
  .on('error', (err) => {
    console.log('Failed to start subprocess.')
  })
  var output = ''
  python.stdout.on('data', function(data){
    output += data
  })
  python.stdout.on('error', function(err){
    throw new Error(err)
  })
  python.stdout.on('close', function(){
    var results = JSON.parse(output)
    cb(results)
  })
}

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({limit: '50mb'}))

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers')
  res.setHeader('Cache-Control', 'no-cache')
  next()
})

function showEntries(db, res, tablename) {
  var cursor = db.collection(tablename).find().limit(5)
  var docs = []
  cursor.each(function(err, doc) {
    assert.equal(err, null)
    if (doc != null) {
      docs.push(doc)
    } 
    else {
      res.send(docs)
    }
   })
}

router.post('/csv', function(req, res) {
  MongoClient.connect(mongoDBUrl, function(err, db) {
  	assert.equal(null, err)
  	const file = req.body.data
  	csv().fromString(file)
  	.on('json',(jsonObj)=>{
		db.collection('life').update({username: 'life'}, jsonObj, {upsert: true})
  	})
  	.on('done',()=>{
  		showEntries(db, res, 'life')
    })
  })
})

router.post('/test', function(req, res) {
  MongoClient.connect('mongodb://death:death@ds159747.mlab.com:59747/life', function(err, db) {
  	assert.equal(null, err)
  	const file = req.body.data
  	csv().fromString(file)
  	.on('json',(jsonObj)=>{
		db.collection('death').update({username: 'death'}, jsonObj, {upsert: true})
  	})
  	.on('done',()=>{
  		showEntries(db, res, 'death')
    })
  })
})

router.get('/data', function(req, res) {
  MongoClient.connect(mongoDBUrl, function(err, db) {
  	assert.equal(null, err)
  	showEntries(db, res, 'life')
	})
})

router.get('/wipe', function(req, res) {
  MongoClient.connect(mongoDBUrl, function(err, db) {
  	assert.equal(null, err)
    db.collection('life').remove( { } )
    db.close()	
    res.send("{}")
  })
})

router.post('/train', function(req, res) {
  MongoClient.connect(mongoDBUrl, function(err, db) {
  	assert.equal(null, err)
    var cursor = db.collection('life').find()
    var param = req.body.data
    var Y = []
    var X = []
  	cursor.each(function(err, doc) {
      assert.equal(err, null)
      if (doc != null) {
        Y.push(doc[param])
        delete doc[param]
        var xList = []
        Object.keys(doc).forEach(function(key) {
		  var val = doc[key]
		  xList.push(val)
		})
		X.push(xList)
      } 
      else {
        SKLearn('preprocessing', ['LabelEncoder'], ['fit_transform', X, Y], death)
        function death(results) {
			    res.send(results)	
		    }
      }
    })
  })
})

app.use('/api', router)
app.listen(port, function() {
  console.log(`api running on port ${port}`)
})

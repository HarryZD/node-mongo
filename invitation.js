
var Step = require('step');
var mongo = require('mongodb');
var BSON = mongo.BSONPure;

var db = new mongo.Db('test', new mongo.Server('localhost', 27017, {auto_reconnect: true}));

db.open(function(err, db) {
	if(!err) {
		console.log("Connected to 'test' database");
		db.collection('invitation', {safe:true}, function(err, collection) {
			if (err) {
				console.log("The 'invitation' collection doesn't exist. Creating it with sample data...");
                //populateDB();
            }
        });
	}
});


exports.create=function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function insertData(err,collection){
			collection.insert(req.body, {safe:true}, this)
		},
		function generateResponse(err, result){
			res.send(result[0]);		
		});	
} 

exports.find=function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function findResult(err,collection){
			collection.findOne({'_id':new BSON.ObjectID(req.params.id)},this);
		},
		function generateResponse(err, result){
			res.send(result);
		});
}

exports.findOpen=function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function findResult(err,collection){
			collection.find({
				'startDate':{$gte: new Date()}, 
				$or :[{'inviter.user.weiboId':req.params.weiboId},{'invitees.user.weiboId':req.params.weiboId}]
			}).skip(req.params.page*8).limit(8).toArray(this);
		},
		function generateResponse(err, item){
			res.send(item);
		});
}

exports.findClosed=function(req, res){
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function findResult(err,collection){
			collection.find({
				'startDate':{$lt: new Date()}, 
				$or :[{'inviter.user.weiboId':req.params.weiboId},{'invitees.user.weiboId':req.params.weiboId}]
			}).skip(req.params.page*8).limit(8).toArray(this);
		},
		function generateResponse(err, item){
			res.send(item);
		});
}

exports.replyStatus= function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function updateData(err,collection){
			collection.findAndModify(
				{'_id':new BSON.ObjectID(req.params.id),'invitees.user.weiboId':req.body.weiboId},[],
				{$set:{'invitees.$.status':req.body.status,'lastUpdateDate':new Date()}}, 
				{safe:true,new:true}, 
				this);
		},
		function generateResponse(err, item){
			res.send(item);			
		});	
} 

exports.replyComment=function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function updateData(err,collection){
			collection.findAndModify(
				{'_id':new BSON.ObjectID(req.params.id)},[],
				{$push:{'replyList':req.body}, $set:{'lastUpdateDate':new Date()}}, 
				{safe:true,new:true}, 
				this);
		},
		function generateResponse(err, item){
			res.send(item);
		});	
}

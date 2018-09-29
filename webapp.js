const express = require('express');
const fs = require('fs');
const config = require('./config.js');
let app = express();
var bodyParser = require('body-parser');//解析,用req.body获取post参数
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '50mb',extended: false}));
app.use(express.static('static'));

let default_message = "睡你麻痹？还有：<br><h1 style='color:red'>%%%residue_day%%%</h1>天就要考试了！！！";
function openFile(path){
	return new Promise(resolve=>{
		fs.open(path, 'a', ()=>{
			resolve();
		})
	})
}

app.get('/get_message', function(req, res){
	let data = fs.readFileSync('./message_module').toString();
	res.send(JSON.stringify({
		message : data
	}))
})

app.post("/set_message", async function(req, res){
	let message = req.body.html;
	fs.writeFileSync('./message_module', message);
	res.sendStatus(200);
})

fs.access('./message_module', function(err) {
    let exists = err ? false : true;
    if(!exists){
    	openFile('./message_module').then(result=>{
    		fs.writeFileSync('./message_module', default_message);
			app.listen(config.webapp.port, function(){
				console.log('listen at ' + config.webapp.port);
			});
		})
    }else {
    	app.listen(config.webapp.port, function(){
    		console.log('listen at ' + config.webapp.port);
    	});
    }
});
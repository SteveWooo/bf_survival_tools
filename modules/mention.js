const nodemailer = require('nodemailer');
const config = require('../config');

function getMailer(){
	let mailer = nodemailer.createTransport({
      service: 'qq', 
      port: 465,
      secureConnection: true,
      auth: config.mail
    });

    return mailer;
}

function send(mailer, options){
	return new Promise((resolve, reject)=>{
		mailer.sendMail(options, (error, info) => {
	      	if (error) {
	        	reject(error);
	      	}
	      	resolve({
	      		code : 0,
	      		info : info
	      	})
	    });
	})
}

module.exports = function(req){
	let mailer = getMailer();
    let options = {
      	from: '"'+config.mail.nickName+'" <'+config.mail.user+'>', // sender address
      	to: '461437874@qq.com',
      	subject: '特别提醒',
     	html: JSON.stringify(req.mention)
    };

    send(mailer, options).then(result=>{
    	console.log(result);
    }).catch(e=>{
    	console.log(e);
    })
}
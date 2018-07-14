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

function start(index, retry, req){
    const mail_list = config.mail.mail_list;
    if(index >= mail_list.length){
        return ;
    }
    let mailer = getMailer();
    let options = {
        from: '"'+config.mail.nickName+'" <'+config.mail.user+'>', // sender address
        to: mail_list[index],
        subject: req.mention.subject,
        html: req.mention.message
    };

    send(mailer, options).then(result=>{
      console.log(result);
      start(index + 1, retry, req);
    }).catch(e=>{
      console.log(e);
      if(retry >= 5){
        start(index+1, 0, req);
      }else {
        start(index, retry+1, req);
      }
      
    })
}

module.exports = function(req){
    start(0, 0, req);
}
const lc = require("lunar-calendar");
const express = require('express');
const cron = require('cron').CronJob;
var request = require('request');
const nodemailer = require('nodemailer');
var app = express();
function err(code = -5000, msg = "", res){
    res.send(JSON.stringify({
        code : code,
        msg : msg
    }));
}

var config = {
    port : 8888,
    ahead : 5,
    mail : {
        user : "461437874@qq.com",
        pass : "lyoko1234////",
        nickName : "男友存活宝典"
    }
}

function get_day(req, res){
    function checking(query){
        if(!(query.year == parseInt(query.year)) ||
            !(query.month == parseInt(query.month)) ||
            !(query.day == parseInt(query.day))){
                return false;
          }
        return true;
    }

    function getDate(query, data){
        for(var i=0;i<data.monthData.length;i++){
            let temp = data.monthData[i];
            if(temp.year == query.year && temp.month == query.month && temp.day == query.day){
                return temp;
            }
        }
    }

    if(!checking(req.query)){
        err(-4010, 'input error', res);
        return ;
    }

    var data = lc.calendar(req.query.year, req.query.month);
    return res.send(JSON.stringify(getDate(req.query, data)));
}

function to_live(req, res, next){
    req = req || {
        query : {}
    }

    res = res || {
        send : (data)=>{
            return data;
        }
    }
    var ts = parseInt(req.query.ts) || +new Date();
    ts += config.ahead * 24 * 60 * 60 * 1000;
    var time = new Date(parseInt(ts))
    req.query = {
        year : time.getFullYear(),
        month : time.getMonth() + 1,
        day : time.getDate()
    }
    return next ? next() : get_day(req, res);
}

app.get('/get_day', get_day);
app.get('/to_live', to_live, get_day);

app.listen(config.port, ()=>{
    console.log('listen at : ' + config.port);
})

const live_list = {
    newDate : {
      '2-14' : {
          name : "情人节"
      },
      '12-25' : {
          name : "圣诞节"
      },
      '6-2' : {
          name : 'test'
      }
    },
    lunarDate : {

    },
    specialNew : {

    },
    specialLunar : {

    }
}
//mail

//参考
function mention(check){
    let transporter = nodemailer.createTransport({
      service: 'qq', 
      port: 465,
      secureConnection: true, // 使用了 SSL
      auth: config.mail
    });

    let mailOptions = {
      from: '"'+config.mail.nickName+'" <'+config.mail.user+'>', // sender address
      to: '461437874@qq.com', // list of receivers
      subject: 'Hello', // Subject line
      // 发送text或者html格式
      // text: 'Hello world?', // plain text body
      html: JSON.stringify(check) // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    });
}

// job
function jobFun(){
    console.log('JOB at:' + new Date());
    let result = JSON.parse(to_live());
    let option = {
       newDate : result.month + "-" + result.day,
       lunarDate : result.lunarMonth + "-" + result.lunarDay,
       specialNew : result.year + "-" + result.month + "-" + result.day,
       specialLunar : result.lunarYear + "-" + result.lunarMonth + "-" + result.lunarDay,
       config : result
    }

    function checkDate(option, live_list){
        var dateResult = [];
        for(var i in live_list){
          if(option[i] in live_list[i]){
            dateResult.push(live_list[i][option[i]]);
          }
        }

        return {
            dateResult : dateResult,
            option : option
        };
    }

    var check = checkDate(option, live_list);
    if(check.dateResult.length != 0){
        //TODO 加入mq
        // mention(check);
    }
}

jobFun();

new cron('0 0 12 * * *', jobFun, null, true, 'Asia/Chongqing');
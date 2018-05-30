const lc = require("lunar-calendar");
const express = require('express');
const cron = require('cron').CronJob;
const request = require('request');
const mysql = require('mysql');
var mention = require('./modules/mention');

const config = require('./config');

function check(req){
	return new Promise((resolve, reject)=>{
		var date = req.date;
		let option = {
	       newDate : date.month + "-" + date.day,
	       lunarDate : date.lunarMonth + "-" + date.lunarDay,
	       specialNew : date.year + "-" + date.month + "-" + date.day,
	       specialLunar : date.lunarYear + "-" + date.lunarMonth + "-" + date.lunarDay,
	    }
	    var live_list = req.liveList;

	    var dateResult = [];
		for(var i in live_list){
			if(option[i] in live_list[i]){
				dateResult.push(live_list[i][option[i]]);
			}
		}

		if(dateResult.length != 0){
			req.mention = dateResult;
			resolve(req);
		}else {
			resolve(undefined);
		}
		
	})
}

function getDay(req){
	return new Promise((resolve, reject)=>{
		//查询操作 可封装
		function getDate(query, data){
	        for(var i=0;i<data.monthData.length;i++){
	            let temp = data.monthData[i];
	            if(temp.year == query.year && temp.month == query.month && temp.day == query.day){
	                return temp;
	            }
	        }
	    }

	    var data = lc.calendar(req.query.year, req.query.month);
	    var date = getDate(req.query, data);
	    req.date = date;
	    resolve(req);
	})
}

function toSurvival(){
	return new Promise((resolve, reject)=>{
		//构造当前时间
		var ts = +new Date();
	    ts += config.ahead * 24 * 60 * 60 * 1000;
	    var time = new Date(parseInt(ts));

	    delete require.cache[require.resolve('./live_list')]

	    var req = {
	    	query : {
	    		year : time.getFullYear(),
	        	month : time.getMonth() + 1,
	        	day : time.getDate()
	    	},
	    	liveList : require('./live_list')
	    }

	    resolve(req);
	})
}

function jobFun(){
	toSurvival().then(result=>{
		return getDay(result);
	}).then(result=>{
		return check(result);
	}).then(result=>{
		if(!result){
			console.log('empty');
		} else {
			// mention(result);
		}
	})
	.catch(e=>{
		console.log(e);
	})
}

// jobFun();
new cron('0 0 12 * * *', jobFun, null, true, 'Asia/Chongqing');

/*
{ query: { year: 2018, month: 6, day: 4 },
  liveList:
   { newDate:
      { '2-14': [Object],
        '12-25': [Object],
        '6-2': [Object],
        '6-4': [Object] },
     lunarDate: {},
     specialNew: {},
     specialLunar: {} },
  date:
   { year: 2018,
     month: 6,
     day: 4,
     zodiac: '狗',
     GanZhiYear: '戊戌',
     GanZhiMonth: '丁巳',
     GanZhiDay: '丁卯',
     worktime: 0,
     term: undefined,
     lunarYear: 2018,
     lunarMonth: 4,
     lunarDay: 21,
     lunarMonthName: '四月',
     lunarDayName: '廿一',
     lunarLeapMonth: 0,
     solarFestival: undefined,
     lunarFestival: undefined },
  mention: [ { name: 'aaa' } ] }
*/
require("dotenv").config();
const { createServer } = require('http');
const { Server } = require('socket.io');
const https = require('https');
const httpServer = createServer();
const moment = require('moment-timezone');
const urlSupabase = process.env.URLSUPABESE;
const pulicApiKeySupabse = process.env.APISUPABASE;
const Database = require("./database.js");
const io = new Server(httpServer, { pingTimeout: 60000 });
let db = null;


var sendNotification = function(data, headers) {
    var options = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers: headers
    };
    
    
    var req = https.request(options, function(res) {  
      res.on('data', function(data) {
        console.log("Response:");
        console.log(JSON.parse(data));
      });
    });
    
    req.on('error', function(e) {
      console.log("ERROR:");
      console.log(e);
    });
    
    req.write(JSON.stringify(data));
    req.end();
  };


io.on('connection', function(socket){
    console.log("Player connected to server!");

    function formatAMPM(date, time) {

        date.setTime(date.getTime() + (time * 60 * 1000));
        date.setHours(date.getHours());
        var time = date, zone = "Asia/Tomsk";
        var m = moment(time);

        moment.fn.zoneName = function () {
            var abbr = this.zoneAbbr();
            return abbrs[abbr] || abbr;
        };

        console.log(m.format('YYYY-MM-DD HH:mm:ss [GMT]ZZ'));
        return m.format('YYYY-MM-DD HH:mm:ss [GMT]ZZ');
      }

    socket.on("create-notification", async (data) =>{
       
        let dataMessage = JSON.parse(data);
        console.log(dataMessage);


        let messageTemp = {
          tittle: dataMessage.tittle, 
          body: dataMessage.body
        }

        let isCreate = await db.createPushNotification(
          dataMessage.userId, 
          dataMessage.urlPicture, 
          messageTemp, 
          formatAMPM(new Date(), dataMessage.time), 
          dataMessage.idNotification);

        if(isCreate){
          console.log("Good create push!");
        }

    });

    socket.on("clear-notification", async (data) =>{
      let dataMessage = JSON.parse(data);
      console.log(dataMessage.userId)
      await db.deleteNotificationAll(dataMessage.userId);
    });
    
});

const send = function(data){

  console.log(data.url);
  let msg = {
    app_id: process.env.IDONESIGNAL,
    contents: 
    {
        "ru": data.body,
        "en" : "Hello My Friend"
    },
    include_external_user_ids: [`${data.userId}`],
    big_picture: data.url
  };

  var headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": process.env.APIONESIGNAL
  };

  sendNotification(msg, headers);
}

httpServer.listen(process.env.PORT, async()=>{
  console.log(`Start server from port: ${process.env.PORT}`)
  db = new Database(urlSupabase, pulicApiKeySupabse);
});

setInterval(async()=>{
  let test = await db.getPushNotification();
  console.log(test);

  test.forEach(element => {
    if(element != null) check(element);
  });
 
}, 60000);

let check = async function(data){
  var dateUser = moment(data.date);
  var currentDate = moment(new Date());
  console.log(dateUser);
  console.log(currentDate);
  var tes = moment(dateUser).isBefore(currentDate); 
  if(tes){
    send({
      userId: data.idUser,
      body: data.message.body,
      url: data.image
    });

    await db.deleteNotificationTarget(data.idUser, data.idNotification);

  }
  else{
    console.log("asd");
  }
}



const { createServer } = require('http');
const { Server } = require('socket.io');
const https = require('https');
const httpServer = createServer();
const moment = require('moment-timezone');
const io = new Server(httpServer, {
    pingTimeout: 60000
});



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

let db = null;
io.on('connection', function(socket){
    console.log("Player connected to server!");

    function formatAMPM(date, time) {
    //     console.log(data);
    //     var hours = date.getHours();
    //     var minutes = date.getMinutes();
    //     // var ampm = hours >= 12 ? 'PM' : 'AM';
    //     // hours = hours % 12;
    //     // hours = hours ? hours : 12; // the hour '0' should be '12'
    //     // minutes = minutes < 10 ? '0'+minutes : minutes;
    //     // var strTime = hours + ':' + minutes + '' + ampm;
    //     console.log(date);

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


        let isCreate = await db.createPushNotification(dataMessage.userId, dataMessage.urlPicture, {
          tittle: dataMessage.tittle,
          body: dataMessage.body
        },
        formatAMPM(new Date(), dataMessage.time));

        if(isCreate){
          console.log("Good create push!");
        }
      

    });

    
});

const send = function(data){

  console.log(data.url);
  let msg = {
    app_id: "45766648-90ee-4f47-b605-b6692516e371",
    contents: 
    {
        "ru": data.body,
        "en" : "Hello My Friend"
    },
    include_external_user_ids: [`${data.userId}`],
    big_picture: data.url
    //send_after : formatAMPM(new Date(), dataMessage.time)
  };

  var headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": `Basic MDQzZjNlMmMtYmJiOC00ZmQ3LTk3YTItNWE1MTdkMzE5MDhi`
  };

  sendNotification(msg, headers);
}
httpServer.listen(52300, ()=>{
  db = new Database(urlSupabase, pulicApiKeySupabse)
});

const { createClient } = require('@supabase/supabase-js');
const urlSupabase = "https://rxmtgtrpftxiysckdhfs.supabase.co";
const pulicApiKeySupabse = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4bXRndHJwZnR4aXlzY2tkaGZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTYwNTE2ODUsImV4cCI6MTk3MTYyNzY4NX0.NInNqTQ5XskqMu_vT8J3orDBU4k-s5EZj77rE4d4t-I";
const Database = require("./database.js");



setInterval(async()=>{
  let test = await db.getPushNotification();
  console.log(test);

  test.forEach(element => {
    if(element != null) check(element);
  });
 
}, 1000);

let check = function(data){
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
  }
  else{
    console.log("asd");
  }
}
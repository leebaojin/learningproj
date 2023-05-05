var http = require('http');
var url = require('url');
var fs = require('fs');
var events = require('events');
let outdate = require('./myDateModule.js');
let weatherData = require('./myWeatherModule.js')

var pageMissing = function(){
    console.log(outdate.dateTimeOut() + "[ERROR] Page Cannot Be Found");
}
var eventEmitter = new events.EventEmitter();
eventEmitter.on("pageMissing",pageMissing);


http.createServer(function(req,res){
    res.writeHead(200,{'Content-Type':'text/plain'});

    let urlPath = url.parse(req.url).pathname;
    //const pathArray = urlPath.split("/");
    console.log(outdate.dateTimeOut() +req.url);
    
    if(urlPath === "/"){
        myhome(req,res);
    }
    else if(urlPath.startsWith("/weather")){
        weather(req,res);
    }
    else if(urlPath === "/add"){
        mysum(req,res);
    }
    else if(urlPath.startsWith("/testapi")){
        testEnd(req,res);
    }
    else if(urlPath.startsWith("/test")){
        testParam(req,res);
    }
    else{
        genericError(req,res);
    }

    
}).listen(8080)

function weather(req,res){
    //This is for the weather
    let resultData = '';
    let searchArr = ['Ang Mo Kio','Changi','Sengkang','Pasir Ris'];
    let urlData = url.parse(req.url,true).query;
    
    if(urlData["loc"] !== undefined){
        let queries = urlData.loc;
        if(queries !== null && queries !== ''){
            searchArr = queries.split(',');
        }
    }    

    let p = weatherData.getWeather(searchArr);
    p.then((result)=>{
        resultData = result;
        let weatherData = '';
        for(let i=0;i<searchArr.length;i++){
            weatherData += "<p>"+resultData[i].loc+" : "+resultData[i].forecast+"</p>"
        }

        fs.readFile('weather.html',function(err,data){
            if(err){
                genericError(req,res);
                return;
            }
            res.writeHead(200,{'Content-Type':'text/html'});
            if(weatherData.length !== 0){
                let dataStr = data.toString().replace(/<p id="weatherData">No Data<\/p>/g, weatherData);
                res.write(dataStr);
            }
            else{
                res.write(data);
            }

            //console.log(dataStr);
            //console.log(data);
            
            res.end();
        });

        
    });
}

function mysum(req,res){
    //This is for sum
    let q = url.parse(req.url,true).query;
    if(q.num1 == null || isNaN(q.num1) || q.num2 == null || isNaN(q.num2)){
        res.writeHead(401,{'Content-Type':'text/plain'});
        res.write('Invalid num1 or num2 parameter in query string!\n');
        res.write('num1 : '+q.num1+'\nnum2 : '+q.num2+'\n');
        res.write('Please put in an appropriate value for add');
        res.end()
        return;
    }
    res.writeHead(200,{'Content-Type':'text/plain'});
    res.end(q.num1.toString() + " + " + q.num2.toString() + " = " + (parseFloat(q.num1)+parseFloat(q.num2)).toString());
    
}

function myhome(req,res){
    //Generic Home
    fs.readFile('index.html',function(err,data){
        if(err){
            genericError(req,res);
            return;
        }
        res.writeHead(200,{'Content-Type':'text/html'});
        res.write(data);
        res.end();
    })
    
}

function testParam(req,res){
    let urlData = url.parse(req.url,true).query;
    res.writeHead(200,{'Content-Type':'text/plain'});
    try{
        let locData = urlData.loc;
        console.log(locData);
        res.write(locData);
    }
    catch(e){
        console.log(e);
        console.log('Fail to find query');
        res.write('NA');
    }

    res.end();
}

function testEnd(req,res){
    fetch("https://mytt-dev.mss-nexus.com/TimesheetMobile/TimesheetStatus?id=10200200&currDate=2022-11", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "authorizationtoken": "eyJraWQiOiJncUxoRXZCZnMwMGNMSWVwRW9BeVA0SzdHRUpiNFhOcFg5R1dhZE91VDU0PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJmNWYzNWM2ZS1kOTE1LTQxOTgtYTI4ZC1iYWZlZjkwMDBlN2EiLCJjb2duaXRvOmdyb3VwcyI6WyJteWN2Om1nciIsIm15dHQ6bWdyIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1zb3V0aGVhc3QtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aGVhc3QtMV9sVFRUWmd5ZDciLCJjb2duaXRvOnVzZXJuYW1lIjoiMTAyMDAyMDAiLCJjdXN0b206Z3JvdXBzIjoibWdyIiwib3JpZ2luX2p0aSI6ImI5YWNlYTI0LWRhYTgtNGRlYS1hOGEwLTg2NzViNmI2MTM4NSIsImF1ZCI6IjFpcmJvOXF0anQxNGFta252b3MxYTcxMGxzIiwiZXZlbnRfaWQiOiJkMWMwNmNmYi05Mjg1LTRlMzQtODE3ZC1jZGE5M2RkNmE0MTgiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY4MzA5NDY3OSwiZXhwIjoxNjgzMDk4Mjc5LCJpYXQiOjE2ODMwOTQ2NzksImp0aSI6IjAyYzU4ZDcyLTRmZmMtNDIwNS1hOTFiLThkYWU1OTkwMzE3MiJ9.Az6n2lmtNQ8mrdBnFBV_Ca2-PGdytTzdeK0T5spQVEKx-WL1REWp8UJQIQrwU-GUdrGV0Yy4I7iDOZUjU0sd6EE3hoGmEiiw0egfqHeejpduWbFyXoMJaNjShsbE1LmXDkRNHmiaW2qcYmYq4E1VLQn6SI6U-BYovEtYMt6q9SLRXSWoUv_Coi7BdekXChKrc3VceAQtjnseo5vflSfhsWNoNNIl6ckhXIvXPPMDPWaNbfClCzb1IhObw-Uki6Fm7ZtHa6k0IZF0loA652n5Aj5XgfNBE0zk-3n1dGm0CUd68kIqkgcW3d4ge35SWSvY7rjOCKkLEL-Eu_dQwc33qA",
    "mytt-ver": "mytt-web/1.1.26",
    "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-api-key": "EarS06xHiZ4QZodKIjsl93ot9O1lyCHN6PNzEz5g",
    "Referer": "https://mytt-dev.mss-nexus.com/Timesheet",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": null,
  "method": "GET"
}).then((response)=>response.json())
.then((data)=>{
    console.log(data);
}).catch((err)=>{
    console.log(err);
});
res.writeHead(200,{'Content-Type':'text/plain'});
res.write('ok');
res.end();
}

function genericError(req,res){
    //This is the generic error
    res.writeHead(404,{'Content-Type':'text/plain'});
    res.end('Page not found!');
    eventEmitter.emit("pageMissing");
}


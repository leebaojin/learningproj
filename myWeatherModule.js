var https = require('https');

const options = {
    hostname: 'api.data.gov.sg',
    path: '/v1/environment/2-hour-weather-forecast',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

const requestWeather = (locations) =>{
  return new Promise((resolve,reject)=>{
        let data = '';

    const request =  https.request(options, (response) => {
      // Set the encoding, so we don't get log to the console a bunch of gibberish binary data
      response.setEncoding('utf8');

      // As data starts streaming in, add each chunk to "data"
      response.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      response.on('end', () => {
        //console.log(data);
        let jsonData = JSON.parse(data);
        let weatherResult = processData(jsonData,locations);
        resolve(weatherResult);
      });
    });

    // Log errors if any occur
    request.on('error', (error) => {
      console.error(error);
    });

    // End the request
    request.end();
  
  })
    
}

function processData(jsonData,searchArr){
    let result = [];
    let period = jsonData.items[0].valid_period;
    let forecast = jsonData.items[0].forecasts;

    for(let i=0;i<searchArr.length;i++){

        for(let j=0;j<forecast.length;j++){

            if(forecast[j].area === searchArr[i].trim()){
                var resultData = {loc:searchArr[i],forecast:forecast[j].forecast};
                result.push(resultData);
                break;
            } 
        }
        
    }
    return result;
}

exports.getWeather=function(loc){
    return requestWeather(loc);
}

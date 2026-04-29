const https = require('https');
const fs = require('fs');

https.get('https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('indiaLocations.json', data);
    console.log('Done');
  });
});

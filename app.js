var mysql = require('mysql');
var twitter = require('twitter');
var creds = require('./creds');
var devclient = new twitter({
  consumer_key: creds.twit.dev.consumer_key,
  consumer_secret: creds.twit.dev.consumer_secret,
  access_token_key: creds.twit.dev.access_token_key,
  access_token_secret: creds.twit.dev.access_token_secret
});
var client = new twitter({
  consumer_key: creds.twit.pro.consumer_key,
  consumer_secret: creds.twit.pro.consumer_secret,
  access_token_key: creds.twit.pro.access_token_key,
  access_token_secret: creds.twit.pro.access_token_secret
});
function genTweet(hr,cb){
  var con = mysql.createConnection({
    host     : creds.mysql.host,
    user     : creds.mysql.user,
    password : creds.mysql.pass,
    database : 'indxio_data',
    multipleStatements: true,
    timezone: 'UTC',
    dateStrings: 'DATETIME',
    timeout: 90000
  });
  con.connect();
  var data = {};
  var pairs = ['btc_usd','btc_eur','ltc_usd','ltc_btc','eth_usd','eth_btc'];
  var q0 = 'SELECT `pair`,`value` FROM `current` WHERE `exchange` = "indx" AND `pair` = "';
  var q1 = '" ORDER BY `timestamp` DESC LIMIT 1;';
  var query = '';
  for(var id in pairs){ query += q0+pairs[id]+q1; }
  con.query(query,function(e,r,f){
    if(e){console.log(e);}else{
      for(var k in r){ var dat = r[k];
        data[dat[0].pair] = dat[0].value;
      }
      con.end();
      var tweet = '#Bitcoin : $'+data.btc_usd+' | €'+data.btc_eur+' \n#Litecoin: $'+data.ltc_usd.toPrecision(6)+' | ฿'+data.ltc_btc.toPrecision(3)+' \n#Ethereum: $'+data.eth_usd+' | ฿'+data.eth_btc.toPrecision(3)+' \n$BTC $LTC $ETH ';
      switch (hr) {
        case 0:
          tweet += '#ASX #NZSX #JPK';
          break;
        case 2:
          tweet += '#SEHK #SSE #SZSE';
          break;
        case 4:
          tweet += '#BSE #NSE';
          break;
        case 8:
          tweet += '#LSE #Euronext';
          break;
        case 14:
          tweet += '#NYSE #NASDAQ #TSX';
          break;
        default:
          tweet += '#INDXIO';
      }
      cb(tweet);
    }
  });
}

genTweet(1,function(tweet0){
  client.post('statuses/update', {status: "Thanks for being patient through the downtime. We are back!"},  function(error, tweet, response) {
    if(error){console.log(error)}else{
      console.log('twat fired');
      console.log(tweet);
    }
  });
  client.post('statuses/update', {status: tweet0},  function(error, tweet, response) {
    if(error){console.log(error)}else{
      console.log('twat fired');
      console.log(tweet);
    }
  });
});
var twatted = 0;
setInterval(function(){
  var chr = new Date().getUTCHours();
  var cmn = new Date().getUTCMinutes();
  var csc = new Date().getUTCSeconds();
  process.stdout.write(chr+':'+cmn+':'+csc+'\r');
  if(cmn === 0 && chr % 2 === 0  && twatted === 0){
    genTweet(chr,function(tweet0){
      client.post('statuses/update', {status: tweet0},  function(error, tweet, response) {
        if(error){console.log(error)}else{
          // console.log(tweet);  // Tweet body.
          // console.log(response);  // Raw response object.
          console.log(chr+':'+cmn+':');
          console.log('twat fired');
          console.log(tweet);
          twatted = 1;
        }
      });
    });
  }
  if(cmn === 1 && chr % 2 === 0 && twatted === 1){ twatted = 0;}
}, 1000);

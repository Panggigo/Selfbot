# Selfbot

https://replit.com/
https://glitch.com/




for 24/7 replit
require("http").createServer((_, res) => res.end("Uptime")).listen(8080)
https://uptimerobot.com/  (filename.user.repl.co)



for 24/7 glitch
https://script.google.com/

function trigger() {
var url = ["yourlink"]
  for(var x = 0; x < url.length; x++) {
    var url = url[x];
    try {
      UrlFetchApp.fetch(url);
    } catch (error) {
      Logger.log(error.message)
    }
  }
} 

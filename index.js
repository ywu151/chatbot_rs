const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "index.htm" );
});
 
app.post('/get_story', urlencodedParser, function (req, res) {
   console.log('StoryId: ', storyId);
   var mysql      = require('mysql');
   var connection = mysql.createConnection({
       host     : 'slugchat-test.lorabit.com',
       user     : 'root',
       password : 'password',
       database : 'slugchat'
   });

   connection.connect();
   var storyId = Math.floor(Math.random() * 700) + 1; 

   var content = "没有找到合适的故事";
   connection.query('SELECT * FROM slugchat.tbl_stories WHERE storyId = ' + storyId, function (error, results, fields) {
       if (error) throw error;
       console.log('StoryId: ', storyId);
       content = results[0]['title'] + '\n' + results[0]['content'];
       console.log('Content: ', content);
       var response = {
           'speech': content,
	   'displayText': results[0]['title'],
	   'data': {},
	   'contextOut': [],
 	   'source': 'RS'
       };
       console.log(response);
       res.send(JSON.stringify(response));
   });
})
 
var server = app.listen(3000, () => console.log('Server running on port 3000'))

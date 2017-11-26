const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "index.htm" );
});

app.get('/test', function (req, res) {
    res.sendFile( __dirname + "/" + "test_index.htm" );
});
 
app.post('/get_story', urlencodedParser, function (req, res) {
   console.log('req.body', req.body);
   var profileId = Number(req.body.sessionId);
   var timeStamp = Date.now();
    console.log('clientId: ', profileId);
    console.log('timeStamp: ', timeStamp);
   var mysql      = require('mysql');
   var connection = mysql.createConnection({
       host     : 'slugchat-test.lorabit.com',
       user     : 'root',
       password : 'password',
       database : 'slugchat'
   });

   var storyId = Math.floor(Math.random() * 700) + 1;

   connection.connect();

   var addSql = 'INSERT INTO slugchat.tbl_logs' +
       '(logId, profileId, createTime, logType, content) ' +
       'VALUES(0,?,?,?,?)';
   var addSqlParams = [profileId, timeStamp, 3, storyId];

   var addLog = new Promise(
       function (resolve, reject) {
           connection.query(addSql, addSqlParams,function (err, result) {
               if(err){
                   console.log('[INSERT ERROR] - ',err.message);
                   reject(err.message);
               }
               else {
                   console.log('---- INSERT LOG----');
                   console.log('INSERT ID:',result);
                   console.log('--------------------\n\n');
                   resolve(storyId);
               }

           });
       }
   );

   var queryStory = function(){
        addLog.then(function (storyId){
            connection.query('SELECT * FROM slugchat.tbl_stories WHERE storyId = ' + storyId, function (error, results) {
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
        }).catch(function(error){
            console.log(error);
        })
   };

   queryStory();
});
 
var server = app.listen(3000, () => console.log('Server running on port 3000'))

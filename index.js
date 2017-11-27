const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require("fs");

app.use(bodyParser.json({limit: '1mb'}));  //body-parser 解析json格式数据
app.use(bodyParser.urlencoded({            //此项必须在 bodyParser.json 下面,为参数编码
    extended: true
}));

//const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(logErrors);

function saveErr(err) {
    fs.open("err.txt","a",function(e,fd){
        if(e) throw e;
        infostr = '----timestamp: ' + Date.now() + '\n' + err.stack + '-----------\n\n';
        fs.write(fd, infostr, function(e){
            if(e) throw e;
            fs.closeSync(fd);
        })
    });
}

function logErrors(err, req, res, next) {
    saveErr("Err\n" +err);
    next(err);
}

app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "index.htm" );
});

app.get('/test', function (req, res) {
    res.sendFile( __dirname + "/" + "test_index.htm" );
});
 
app.post('/get_story', function (req, res) {
    console.log('req.body', req.body);
    var response = {
        'speech': '没有找到故事',
        'displayText': '没有找到故事',
        'data': {},
        'contextOut': [],
        'source': 'RS'
    };
    if(! req.body.hasOwnProperty('sessionId')){
        console.log('没有找到故事');
        res.send(JSON.stringify(response));
    } else {
        var profileId = Number(req.body['sessionId']);
        var timeStamp = Date.now();
        console.log('clientId: ', profileId);
        console.log('timeStamp: ', timeStamp);
        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : process.argv[2],
            user     : process.argv[3],
            password : process.argv[4],
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
                if (!isNaN(profileId)) {
                    connection.query(addSql, addSqlParams, function (err, result) {
                        if (err) {
                            saveErr("Can't insert log err\n" + JSON.stringify(err));
                            reject(err.message);
                        }
                        else {
                            console.log('---- INSERT LOG----\nINSERT ID:'
                                + result + '--------------------\n\n');
                            resolve(storyId);
                        }

                    });
                } else {
                    console.log('CAN NOT FIND CLIENT ID\n--------------------\n\n');
                    resolve(storyId);
                }
            }
        );

        var queryStory = function(){
            addLog.then(function (storyId){
                connection.query('SELECT * FROM slugchat.tbl_stories WHERE storyId = ' + storyId, function (error, results) {
                    if (error) {
                        console.log(error);
                        saveErr("Can't query story err\n" + JSON.stringify(error));
                        res.send(JSON.stringify(response));
                    } else {
                        console.log('StoryId: ', storyId);
                        title = results[0]['title'];
                        content = title + '\n' + results[0]['content'];
                        response['speech'] = content;
                        response['displayText'] = title;
                        console.log('response:');
                        console.log(response);
                        console.log('--------------------\n\n\n\n\n');
                        res.send(JSON.stringify(response));
                    }
                });
            }).catch(function(error){
                saveErr("Can't promise err\n" + error)
            })
        };

        queryStory();
    }
});
 
var server = app.listen(3000, () => console.log('Server running on port 3000'))

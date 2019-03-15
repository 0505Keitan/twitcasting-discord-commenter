const {Client, RichEmbed} = require('discord.js');
const client = new Client();
const fs = require("fs");
const request = require('request');

client.on('message', async msg => {
    const memberId = msg.author.id;
    if(msg.channel.type === 'dm'){
        if(msg.content.startsWith('!token')){
            var args = msg.content.split(' ');
            var twitcas = JSON.parse(fs.readFileSync('./api/twitcas/token.json'));
            var token = args[1];
            var userId = msg.author.id;
            var options = {
                url: 'https://apiv2.twitcasting.tv/verify_credentials',
                headers: {
                    'Accept':'application/json',
                    'X-Api-Version':'2.0',
                    'Authorization':'Bearer ' + token,
                },
                json: true
            };
            request.get(options, function(error, response, body){
                if(body.error == undefined){
                    if(typeof twitcas[userId] === 'undefined'){
                        twitcas[userId] = {name : '', token : ''};
                    }
                    twitcas[userId].token = token;
                    twitcas[userId].name = body.user.name;
                    var charset = 'utf-8';
                    var place = './api/twitcas/token.json';
                    fs.writeFileSync(place, JSON.stringify(twitcas), charset);
                    var un = body.user.name;
                    msg.reply(un + 'でログインしました！');
                    return;
                }else{
                    msg.reply('認証できませんでした。トークンを確認してください。');
                    return;
                }
            });
        }
        return;
    }
    
    if(msg.author.bot){
        return;
    }
    
    if(msg.channel.id === '554665961630990336'){
        if(msg.content === '!login'){
            msg.author.send("<https://example.com/login>\nにアクセスして認証し、表示されたコードをここにコピペしてね。");
        }
        
        if(msg.content === '!signIn'){
            var twitcas = JSON.parse(fs.readFileSync('./api/twitcas/token.json'));
            if(typeof twitcas[msg.author.id] === 'undefined'){
                msg.reply('先に`!login`でユーザー認証を済ませてください！');
                return;
            }else{
                var token = twitcas[msg.author.id].token;
            }
            var options = {
                url: 'https://apiv2.twitcasting.tv/verify_credentials',
                headers: {
                    'Accept':'application/json',
                    'X-Api-Version':'2.0',
                    'Authorization':'Bearer ' + token,
                },
                json: true
            };
            request.get(options, function(error, response, body){
                if(body.error == undefined){
                    var memId = msg.author.id;
                    var userName = twitcas[memId].name;
                    var member = msg.guild.members.get(memId);
                    var role = msg.guild.roles.find(role => role.name === "twitcas");
                    member.addRole(role);
                    msg.reply('ようこそ ' + userName + '。ツイキャスコメントを楽しもう！');
                    return;
                }else{
                    msg.reply('アクセストークンの期限が切れています。認証のやり直しをお願いいたします。\n```' + body.error.code + ', ' + body.error.message + '```');
                    return;
                }
            });
        }
        
        if(msg.content === '!getID'){
            var twitcas = JSON.parse(fs.readFileSync('./api/twitcas/token.json'));
            var userId = msg.author.id;
            if(typeof twitcas[userId] === 'undefined'){
                msg.reply('先に`!login`でユーザー認証を済ませてください！');
                return;
            }else{
                var token = twitcas[userId].token;
            }
            var options = {
                uri: "https://apiv2.twitcasting.tv/users/yasalabo/current_live",
                headers: {
                    'Accept':'application/json',
                    'X-Api-Version':'2.0',
                    'Authorization':'Bearer ' + token,
                },
                json: true
            };
            request.get(options, function(error, response, body){
                if(body.error == undefined){
                    var now = new Date();
                    var year = now.getFullYear();
                    var mon = now.getMonth() + 1;
                    var day = now.getDate();
                    var todays = String(year) + String(mon) + String(day);
                    var movieid = JSON.parse(fs.readFileSync('./api/twitcas/movieid.json'));
                    if(typeof movieid[todays] === 'undefined'){
                        movieid[todays] = {id : ''};
                    }
                    var movieId = body.movie.id;
                    msg.reply('動画IDを取得しました！');
                    movieid[todays].id = movieId;
                    var charset = 'utf-8';
                    var place = './api/twitcas/movieid.json';
                    fs.writeFileSync(place, JSON.stringify(movieid), charset);
                }else if(body.error.code == 404){
                    msg.reply('現在配信していません。');
                }
            });
        }
    }
    
    if(msg.channel.id === '000000000000000000'){
        var userId = msg.author.id;
        var now = new Date();
        var year = now.getFullYear();
        var mon = now.getMonth() + 1;
        var day = now.getDate();
        var todays = String(year) + String(mon) + String(day);
        var movieid = JSON.parse(fs.readFileSync('./api/twitcas/movieid.json'));
        var twitcas = JSON.parse(fs.readFileSync('./api/twitcas/token.json'));
        msg.delete();
        if(typeof twitcas[userId] === 'undefined'){
            if(msg.author.bot){
                return;
            }
            msg.delete();
            msg.reply('先に<#000000000000000000>でユーザー認証を済ませてください！');
            return;
        }else if(typeof movieid[todays] === 'undefined'){
            if(msg.author.bot){
                return;
            }
            msg.delete();
            msg.reply('先に<#000000000000000000>で`!getID`を入力してください！');
            return;
        }
        var token = twitcas[userId].token;
        var movieID = movieid[todays].id;
        var options = {
            url: 'https://apiv2.twitcasting.tv/movies/' + movieID + '/comments',
            headers: {
                'Accept':'application/json',
                'X-Api-Version':'2.0',
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + token,
            },
            body: {
                "comment": msg.content,
                "sns": "none"
            },
            json: true
        };
        request.post(options, function(error, response, body){
        });
    }

client.login('XXXXXXXXXXXXXXXX');
var express = require('express');
var cors = require('cors'); 
const fetch = (...args) => 
    import('node-fetch').then(({default: fetch}) => fetch(...args));
var bodyParser = require ('body-parser')

const CLIENT_ID = 'Iv1.5f95480a214aafea';
const CLIENT_SECRET = '16d9140a9b1ae54d7b0915193b1d380edd337dfe';

var app = express();

app.use(cors());
app.use(bodyParser.json());
app.options('*', cors());

app.get('/getAccessToken' , async function (req,res){
    req.query.code;

    const pamars = '?client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&code=' + req.query.code;

    await fetch('https://github.com/login/oauth/access_token' + pamars,{
        method:'POST',
        headers:{
            'Accept':'application/json'
        }
    }).then((response) => {
        return response.json();
    }).then((data) => {
        console.log(data);
        res.json(data);
    });
});
app.get('/getUserData', async function (req,res){
    req.get('Authorizaion');
    await fetch('https://api.github.com/user',{
        method:'GET',
        headers:{
            'Authorization': req.get('Authorization')
        }
    }).then((response)=>{
        return response.json();
    }).then((data) => {
        console.log(data);
        res.json(data);
    });
})

// 错误处理中间件
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});


app.listen(4000, function(){
    console.log('cors server running on port 4000');
});
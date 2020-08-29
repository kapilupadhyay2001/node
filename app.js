const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { resolveInclude } = require("ejs");
var MongoClient = require('mongodb').MongoClient;
const app = express();
// ---------user_stats-------------
const user_info=[];
const user_data=[];  //number of match played by user
const user_stats_info=[];
const infinity_match_history_info=[];
const battle_match=[];
var chart=[];
var db;
var users;
var users_stats;
var match_history;
var total_match;
var infinity_match_history;
var total;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));






function DB()
{
  MongoClient.connect("mongodb+srv://pandvas:GZ52aNBflMUUHVKS@test-e7uyp.mongodb.net/mpl?retryWrites=true&w=majority",{useUnifiedTopology: true,useNewUrlParser: true},
  function(err,client)
  {
    if(err)
    {
      console.log(err);
    }
    else
    {
      console.log("conection is establish with database");
      db = client.db("mpl");
      users = db.collection("users");
      users_stats  = db.collection("users_stats");
      match_history=db.collection("match_history");
      infinity_match_history=db.collection("infinity_match_history");
    }
    database();
  })
  
}


function database()
{
  users.find({},function(err,data)  //user collection
  {
    data.forEach(element => 
      {
        user_info.push(element);        // array-> information of user collection
      users_stats.findOne({user_id:element.user_id},function(er,dt)   //user_stats collection
        {
      user_stats_info.push(dt);           // array-> information of user_stats collection
        })
        match_history.find({user_id:element.user_id}).toArray(function(err,docs)    //match history collection
        {
          user_data.push(docs.length);      // array-> number of match played by user correspon to user_id
          docs.forEach(e=>{
            battle_match.push(e);       // array-> information of match history collection
          });
        })
      });
  })

  

  infinity_match_history.find({}).toArray(function(err,data){
    data.forEach(ele=>{
      infinity_match_history_info.push(ele); // array-> information of infinity match history collection
    });
  })
}

function general(){
  for(var i=1; i<=31;i++){
    if(i<10){ var day='0'+String(i)}
    else{ var day=String(i)}
    var mon='Jul';
    var year='2020';
    var date=mon+" "+day+" "+year;
  
    var date_inf_match=infinity_match_history_info.filter(function(ele){return String(ele.created_at).substring(4,15)==date}).length;
    var date_token_match=battle_match.filter(function(ele){ if((ele.match_type=='token_battle') && (String(ele.created_at).substring(4,15)==date)){return ele}}).length;
    var date_cash_match=battle_match.filter(function(ele){ if((ele.match_type=='cash_battle') && (String(ele.created_at).substring(4,15)==date)){return ele}}).length;
    chart.push([date,date_inf_match,date_token_match,date_cash_match])
}
}


app.get('/home',function(req,res){
  total_match =user_data.reduce(function (a, b) {return a + b;});
  total=total_match+infinity_match_history_info.length;
  battle_match.filter(function(ele){return ele.match_type=='token_battle'}).length;
  chart=[];
  general();
  res.render('home',{
    total_match:total,
    total_user:user_info.length,
    total_inf_match:infinity_match_history_info.length,
    total_inf_battel_match:total_match,
    total_inf_tokken_battel_match:battle_match.filter(function(ele){return ele.match_type=='token_battle'}).length,
    total_inf_cash_battel_match:battle_match.filter(function(ele){return ele.match_type=='cash_battle'}).length,
    tabel:chart
  });
})


app.get('/user',function(req,res)
{
  res.render('list',{
    user_data:user_data, //number of match played by user
    test:user_info
   
  });
})

app.get('/main',function(req,res){
  res.render(sidenav);
})

app.post('/find',function(req,res){
  
  res.render('user_info',{
    id:req.body.a,
    name:req.body.name,
    photo:req.body.photo,
    user_stats_info:user_stats_info
  });
})

app.post("/query",function(req,res){
  console.log(req.body.month);
})



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() 
{
  console.log("Server started Started Successfully");
  DB();
 
});
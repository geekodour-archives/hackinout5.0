var hypercore = require('hypercore');
function updateUserAmount(user, amount) {
    var feed = hypercore('./'+user, {valueEncoding: 'json'});
    feed.append(amount);
}

function fetchUserAmount(user,cb) {
    var feed = hypercore('./'+user, {valueEncoding: 'json'} );
    feed.head((err,data)=>{
        if(err) cb(err);
        else cb(null, data);
    });
}

//random call 
fetchUserAmount("devika", (err, data)=>{
    console.log("dataaa :" + data);
});

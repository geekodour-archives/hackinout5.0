var hypercore = require('hypercore');

function updateUserAmount(username, amount, userType) {
  return new Promise((resolve, reject)=>{

    try{
      let feed = hypercore('./log/users/'+username, {valueEncoding: 'json'});
      feed.head((a)=>{
        console.log(a)
        resolve(a)
        //if(userType === 0){
        //  feed.append(a-amount);
        //}
        //else if(userType === 1){
        //  feed.append(a+amount);
        //}
      })
    }catch(e){
      console.log(e)
      reject()
    }


  })
}

function fetchUserAmount(user,cb) {
    var feed = hypercore('./'+user, {valueEncoding: 'json'} );
    feed.head((err,data)=>{
        if(err) cb(err);
        else cb(null, data);
    });
}

module.exports = {
    updateUserAmount : updateUserAmount
}

var hypercore = require('hypercore');

function updateUserAmount(username, amount, userType) {
  return new Promise((resolve, reject)=>{

    try{
      let feed = hypercore('./log/users/'+username, {valueEncoding: 'json'});
      feed.head((a)=>{
        console.log('DATA',a);
        if(userType === 0){
          feed.append(a-amount,()=>{ });
          resolve(a-amount)
        }
        else if(userType === 1){
          feed.append(a+amount,()=>{ });
          resolve(a+amount)
        }
      })
    }catch(e){
      feed.append(amount,()=>{});
      resolve(amount)
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

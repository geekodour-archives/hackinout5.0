var hypercore = require('hypercore')

var feed = hypercore('./srijan', {valueEncoding: 'utf-8'})

current_balance = feed.head( ()=>{})
console.log(current_balance);
if(!current_balance) feed.append(30);

feed.append(parseInt(current_balance)+23, function (err) {
  if (err) throw err
  console.log(feed.length)
})

//feed.get(2,(err,data)=>{
//    console.log(data);
//})

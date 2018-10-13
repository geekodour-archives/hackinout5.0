var hypercore = require('hypercore')

var feed = hypercore('./srijan', {valueEncoding: 'utf-8'})

current_balance = feed.head(, ()=>{})

feed.append(current_balance+(-23), function (err) {
  if (err) throw err
  console.log(feed.length)
})

//feed.get(2,(err,data)=>{
//    console.log(data);
//})

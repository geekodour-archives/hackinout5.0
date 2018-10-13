const hypercore = require('hypercore');
const hypertrie = require('hypertrie');
const db = hypertrie('../log/txnmap', {valueEncoding: 'json'});
const feed = hypercore('../log/journal', {valueEncoding: 'json'});

//function quote(val) {
//    return '"'+val+'"';
//}

// function printall() {
//     var db = hypertrie('./details', {valueEncoding: 'json'});
//     var ite = db.iterator();
//     ite.next(function loop(err, node) {
//         if(err) {console.log(err); return;}
//         if(!node) {console.log("not node");return;}
//         console.log("node : "+node.key);
//         console.log("val :" + node.value);
//         ite.next(loop);
//     })
// }


//function addValue(key, val) {
//    db.put(key, val,()=>{ });
//}

function addEntry(metadata, stat) {
    metadata["status"] = stat;
    feed.append(metadata,(err) => {
        let blockId = feed.length;
        db.put(metadata['txnId'], blockId);
    });
}

function getIndex(txnId,cb) {
    db.get(txnId,(err, dat)=>{
        if(err) cb(err);
        else cb(null,dat);
    })
}

function getTransaction(txnId,cb) {
    getIndex(txnId,(err,txnPair)=>{
        if(err) throw "Transaction is invalid"
        let blockId = parseInt(txnPair.value);
        feed.get(blockId,(err,block)=>{
            if(err) cb(err);
            else cb(null, block);
        })
    });
}


//Random entry shizz
//addEntry({"sender":"abc", "txnid":"abb"},"success");
//
//getTransaction("abb",(err,val)=>{
//    if(err) console.log(err);
//    else console.log(val);
//});

module.exports = {
    getTransaction : getTransaction
}

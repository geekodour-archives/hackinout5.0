const hypercore = require('hypercore');
const hypertrie = require('hypertrie');


function addEntry(metadata, stat) {
    metadata["status"] = stat;
    console.log(metadata)
    const feed = hypercore('./log/journal', {valueEncoding: 'json'});
    const db = hypertrie('./log/txnmap', {valueEncoding: 'json'});
    feed.append(metadata,(err) => {
        let blockId = feed.length;
        db.put(metadata['txId'], blockId);
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
    getTransaction : getTransaction,
    addEntry : addEntry
}

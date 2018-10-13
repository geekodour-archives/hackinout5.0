var hypercore = require('hypercore');
var hypertrie = require('hypertrie');
function quote(val) {
    return '"'+val+'"';
}

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



function addValue(key, val) {
    var db = hypertrie('./details', {valueEncoding: 'json'});
    db.put(key, val,()=>{
        db.get(key,(err, dat)=>{
            // console.log(dat);
        });
    });
}

function addEntry(metadata, stat) {
    var feed = hypercore('./globalJournal', {valueEncoding: 'json'}); //+sender
    metadata["status"]=stat;
    feed.append(metadata,(err) => {
        var ind = feed.length;// check in hash table if there exist a key with metadata[txnid] and update it to ind;
        addValue(metadata["txnid"], ind);
    });
}

function getIndex(tnid,cb) {
    var db = hypertrie('./details', {valueEncoding: 'json'});
    db.get(tnid,(err, dat)=>{
        if(err) cb(err);
        else cb(null,dat);
    })
}
function getTransaction(tnid,cb) {
    getIndex(tnid,(err,dat)=>{
        if(err) console.log(err);
        
        // console.log(dat.value);
        var val = parseInt(dat.value);
        var feed=hypercore('./globalJournal', {valueEncoding: 'json'});
        feed.get(val,(err,dat)=>{
            if(err) cb(err);
            else cb(null, dat);
            // console.log("hello data : "+dat);
        })
    });
}


//Random entry shizz
addEntry({"sender":"abc", "txnid":"abb"},"success");

getTransaction("abb",(err,val)=>{
    if(err) console.log(err);
    else console.log(val);
});
// printall();


const express = require("express");
const bodyParser = require("body-parser");
const equal = require("deep-equal");
const WebTorrent = require("webtorrent");
const rsa = require("node-rsa");
const axios = require("axios");
const qs = require("qs");






//var crypto = require('crypto');
//const sha1 = require('simple-sha1')



const utils = require('./utils')

const app = express()
app.use(bodyParser.json());

const port = 7000


app.get('/', (req, res) => res.send('Welcome to the API'))

app.post('/transfer', (req, res) => {

    try {
        const reqdKeys = ['txId','sTime','eTime','sndr','rcvr','amt']
        reqdKeys.forEach((key)=>{
            try{
                req.body.metadata.hasOwnProperty(key)
            } catch(e){
                throw "missing key"
            }
        })
        let sndrPubKey = req.body.sndrPubKey;
        let rcvrPubKey = req.body.rcvrPubKey;
        let signedData = req.body.signedData;

        let returnData = { encT : {}, encR : {}, metadata : req.body.metadata, encS : signedData}
        
        if( !(sndrPubKey && rcvrPubKey && signedData) ){
            throw "missing key";
        }

        utils.decryptSigned(signedData,sndrPubKey)
            .then((e)=>{
                let metadata = JSON.parse(e)
                if(!equal(metadata, req.body.metadata)){
                    throw "metadata and encryped metadata do not match"
                }
                //const checkTxnId = utils.checkTxnId(metadata.txId);
                const checkExist = utils.checkExist(sndr, rcvr);
                const checkElgb = utils.checkElgb(sndr, amt);

                //Promise.all([checkTxnId, checkTime, checkExist, checkElgb])
                Promise.all([checkTxnId, checkExist, checkElgb])
                    .then((values)=>{
                        utils.genKeyRetEncAndPub()
                          .then((e)=>{
                            e.encT = e.signedData;
                            utils.encryptData(e.public_key, rcvrPubKey)
                                .then(e=>{
                                    returnData.encR = e;
                                    // we should log and send data back now
                                    let buf4 = new Buffer(JSON.stringify(returnData));
                                    buf4.name = "data"
                                    const client = new WebTorrent()
                                    let hash;
                                    client.seed(buf4, function (torrent) {
                                        hash = torrent.infoHash
                                        client.destroy()
                                    })
                                    // log into journal
                                })
                                .catch(e=>{
                                    console.log(e)
                                })
                          })
                        .catch((e)=>{
                          console.log(e)
                        })
                    })
                    .catch((e)=>{
                        console.log(e)
                        console.log('something bad happened')
                    })

                // 1. check txnId
                // 3. exist
                // 4. eligible
                //  1.1 fetchUserHead.amount > amt

                // 5. generate temp key pair
                // 6. encrypt 'something' with tempPrivateKey --> A
                // 7. encrypt tempPublicKey with rcvrPubKey  --> B
                // 8. hash = computeHash(File(A+B+signedData+metadata))
                // 9. globalAppendLog(metadata, signedData, hash)
                //  9.1 update hypertrie
                // 10. send (metadata,A,B,signedData) to browser of sender
                console.log('all good till now')
            })
            .catch((e)=>{
                console.log(e)
                throw "Wrong encrypted data or key"
            })

    } catch(e){
        console.log(e);
        // actually send error to user
    }

})

app.post('/redeem', (req, res) => {
    // localhost/redeem?txid=ashjkhasdhjashd
    // 1. get txid 
    // 2. get txid data
    //  2.1 if txid is already successful or failed return
    //  2.2 check if expired(time)
    //      2.2.1 log as failed
    // 3. extract 'temp public key' from post data -->X 
    // 4. extract 'encrypted stuff by temp private key' from post data --> Y
    // 5. check if Y is decrypted by X
    //  5.1 if not: discard and log as failed
    //  5.2 if ok: continue
    // 6. log update
    //  6.1 update 3rd column in hypertrie with increment
    //  6.2 update sender (amount, txnId)
    //  6.3 update 3rd column in hypertrie with increment
    //  6.2 update reciever (amount, txnId)
    //  6.3 update 3rd column in hypertrie with increment
    //  6.3 update global log + update htpertrie
    // 7. send success info and dat replicate and public key of the user
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

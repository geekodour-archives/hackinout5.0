const express = require("express");
const bodyParser = require("body-parser");
const equal = require("deep-equal");
const WebTorrent = require("webtorrent");
const rsa = require("node-rsa");
const cors = require('cors')
const axios = require("axios");
const utils = require('./utils')

const app = express()
app.use(bodyParser.json());
app.use(cors())
const port = 8000

app.get('/', (req, res) => res.send('Welcome to the API'))

app.post('/transfer', (req, res, next) => {

    try {
        const reqdKeys = ['txId','sndr','rcvr','amt']
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
                //const checkExist = utils.checkExist(sndr, rcvr);
                //const checkElgb = utils.checkElgb(sndr, amt);
                //Promise.all([checkTxnId, checkTime, checkExist, checkElgb])

                utils.genKeyRetEncAndPub()
                  .then((e)=>{
                    returnData.encT = e.signedData;
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
                                utils.appendToLog(metadata, hash, signedData, 'start')
                                res.send(JSON.stringify(returnData));
                                client.destroy()
                            })
                            // log into journal
                        })
                        .catch(e=>{
                            console.log(e)
                        })
                  })


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

app.post('/redeem', (req, res, next) => {
    let tempPubKey = req.body.tempPubKey;
    let encData = req.body.encData;
    let metadata = req.body.metadata;
    utils.decryptSigned(encData,tempPubKey)
        .then((e)=>{
            utils.updateUserData(metadata.sndr, metadata.amt, 0)
            utils.updateUserData(metadata.rcvr, metadata.amt, 1)
            utils.appendToLog(metadata, null, null, 'success')
            res.send(JSON.stringify({status: 'OK'}));
        })
        .catch((e)=>{
            utils.appendToLog(metadata, null, null, 'failed')
        })
})

app.listen(port,'0.0.0.0', () => console.log(`Example app listening on port ${port}!`))


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

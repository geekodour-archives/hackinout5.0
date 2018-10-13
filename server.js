const express = require('express')
const bodyParser = require('body-parser');
const equal = require('deep-equal');
const rsa = require('node-rsa');

const utils = require('./utils')

const app = express()
app.use(bodyParser.json());

const port = 3000


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
        
        if( !(sndrPubKey && rcvrPubKey && signedData) ){
            throw "missing key";
        }

        utils.decryptSigned(signedData,sndrPubKey)
            .then((e)=>{
                let metadata = JSON.parse(e)
                if(!equal(metadata, req.body.metadata)){
                    throw "metadata and encryped metadata do not match"
                }
                const checkTxnId = utils.checkTxnId;
                //const checkTime = utils.checkTime;
                //const checkExist = utils.exist;
                //const checkElgb = utils.eligible;

                //Promise.all([checkTxnId, checkTime, checkExist, checkElgb])
                Promise.all([checkTxnId])
                    .then((values)=>{
                        console.log('allgoood')
                        let key = new rsa({b: 512});
                        const encrypted = key.encrypt('something', 'base64');
                        console.log(key.exportKey([ 'scheme-pkcs8-public' ]));
                    })
                    .catch((e)=>{
                        console.log(e)
                        console.log('something bad happened')
                    })

                // 1. check txnId
                // 2. check time
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

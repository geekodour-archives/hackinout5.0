const express = require('express')
const bodyParser = require('body-parser');
const utils = require('./utils')

const app = express()
app.use(bodyParser.json());

const port = 3000


app.get('/', (req, res) => res.send('Welcome to the API'))

app.post('/transfer', (req, res) => {

    try {
        // check if encrypted metadata === recieved metadata
        const reqdKeys = ['txId','sTime','eTime','sndr','rcvr','amt']
        reqKeys.forEach((key)=>{
            if(!req.body.metadata.hasOwnProperty(key)){
                throw "missing key"
            }
        })
        let sndrPubKey = req.body.sndrPubKey;
        let rcvrPubKey = req.body.rcvrPubKey;
        let signedData = req.body.signedData;


        utils.decryptSigned(signedData,sndrPubKey)
            .then((e)=>{
                let metadata = JSON.parse(e)
            })
            .catch((e)=>{
                throw "missing key"
            })

                 

    } catch(e){
        console.log(e);
    }

})

app.get('/redeem', (req, res) => {

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

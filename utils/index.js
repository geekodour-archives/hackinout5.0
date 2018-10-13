const kbpgp = require('kbpgp');

const decryptSigned = (encData, senderPubKey) => {
  return new Promise((resolve, reject)=>{
    kbpgp.KeyManager.import_from_armored_pgp({ armored: senderPubKey }, (err, sender)=> {
      if (!err) {
        let ring = new kbpgp.keyring.KeyRing;
        ring.add_key_manager(sender);
        kbpgp.unbox({keyfetch: ring, armored: encData}, function(err, literals) {
          if (err != null) {
            reject()
          } else {
            resolve(literals[0].toString()); 
          }
        });
      }
    });
  })
}

module.exports = {
  decryptSigned: decryptSigned
}

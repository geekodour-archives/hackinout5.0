const kbpgp = require("kbpgp");
const journal = require("./journal");
const axios = require("axios");
const qs = require("qs");
const hypercore = require("hypercore");

const decryptSigned = (encData, senderPubKey) => {
  return new Promise((resolve, reject) => {
    kbpgp.KeyManager.import_from_armored_pgp(
      { armored: senderPubKey },
      (err, sender) => {
        if (!err) {
          let ring = new kbpgp.keyring.KeyRing();
          ring.add_key_manager(sender);
          kbpgp.unbox({ keyfetch: ring, armored: encData }, function(
            err,
            literals
          ) {
            if (err != null) {
              reject();
            } else {
              resolve(literals[0].toString());
            }
          });
        }
      }
    );
  });
};

const checkTxnId = id => {
  return new Promise((resolve, reject) => {
    journal.getTransaction(id, (err, block) => {
      if (err) resolve();
      reject();
    });
  });
};

const checkExist = (sndr, rcvr) => {
  return new Promise((resolve, reject) => {
    let request = axios
      .get("https://keybase.io/_/api/1.0/user/lookup.json", {
        params: {
          usernames: [sndr, rcvr]
        },
        paramsSerializer: params => {
          return qs.stringify(params);
        }
      })
      .then(response => {
        resolve(response.data.them.some(w => w === null))
      }
      .catch(response => {
        reject()
      });
  });
};

const checkElgb = (sndr, amt) => {
  return new Promise((resolve, reject) => {
    let feed = hypercore('./logs/users/{sndr}', {valueEncoding: 'json'})
    feed.head((err, data) => {
      if (err) {
        reject();
      }
      if (amt < data) {
        reject();
      }
       resolve((amt - data));
    });
  });
};

const generateKeyAndReturnEncDataAndPublicKey = () => {
  return new Promise((resolve, reject) => {
    let F = kbpgp["const"].openpgp;
    let opts = {
      userid: "temp",
      primary: {
        nbits: 1024,
        flags: F.sign_data
      },
      subkeys: [
        {
          nbits: 1024,
          flags: F.sign_data
        }
      ]
    };

    kbpgp.KeyManager.generate(opts, function(err, temp) {
      if (err) {
        reject();
      }
      temp.sign({}, function(err) {
        let public_key;
        let signedData;
        let params = { msg: "something", sign_with: temp };
        kbpgp.box(params, function(err, result_string, result_buffer) {
          signedData = result_string;
          temp.export_pgp_public({}, function(err, pgp_public) {
            public_key = pgp_public;
            resolve({ public_key: public_key, signedData: signedData });
          });
        });
      });
    });
  });
};

const encryptData = (plainText, pubKey) => {
  return new Promise((resolve, reject) => {
    kbpgp.KeyManager.import_from_armored_pgp(
      { armored: pubKey },
      (err, someone) => {
        if (!err) {
          let params = { msg: plainText, encrypt_for: someone };

          kbpgp.box(params, function(err, result_string, result_buffer) {
            resolve(result_string);
          });
        }
      }
    );
  });
};

module.exports = {
  decryptSigned: decryptSigned,
  checkTxnId: checkTxnId,
  genKeyRetEncAndPub: generateKeyAndReturnEncDataAndPublicKey,
  encryptData: encryptData
};

/*
const checkTxnId = util.checkTxnId;
const checkTime = util.checkTime;
const checkExist = util.exist;
const checkElgb = util.eligible;
*/

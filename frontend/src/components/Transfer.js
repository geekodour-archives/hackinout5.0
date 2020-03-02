import React, { Component } from 'react';
import copy from 'copy-to-clipboard';
import Chance from 'chance'
import axios from 'axios'
const port = 8000;

const chance = new Chance();

class Transfer extends Component {

  constructor(props) {
    super(props);
    this.state = {sndr: '', rcvr: '', amt: 0, signedData: '', txId: ''};
    this.handleSndrChange = this.handleSndrChange.bind(this);
    this.handleRcvrChange = this.handleRcvrChange.bind(this);
    this.handleAmtChange = this.handleAmtChange.bind(this);
    this.handleSignedDataChange = this.handleSignedDataChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getKeys = this.getKeys.bind(this);
  }

  copyMetaData(event){
    event.preventDefault()
    const dataDiv = document.querySelector('#metadata')
    copy(JSON.stringify(dataDiv.innerText))
  }
  
  handleSndrChange(event) {
    this.setState({sndr: event.target.value});
  }
  handleRcvrChange(event) {
    this.setState({rcvr: event.target.value});
  }
  handleAmtChange(event) {
    this.setState({amt: event.target.value}); // probaby parseInt
  }
  handleSignedDataChange(event) {
    this.setState({signedData: event.target.value});
  }

  componentDidMount() {
    this.setState({txId: chance.hash({length:8})})
  }

  getKeys(){
    return new Promise((resolve, reject)=>{
      let sndr = this.state.sndr;
      let rcvr = this.state.rcvr;
      let keys = {sndr:'',rcvr:''}
      let p1 = axios.get(`https://keybase.io/${sndr}/pgp_keys.asc`)
      let p2 = axios.get(`https://keybase.io/${rcvr}/pgp_keys.asc`)

      Promise.all([p1,p2])
        .then((e)=>{
          keys.sndr = e[0].data
          keys.rcvr = e[1].data
          resolve(keys)
        })
        .catch(e=>{
          reject()
        })
    })
  }

  handleSubmit(event) {
    event.preventDefault();
    let dataToBeSent = {
      metadata: {
        sndr: this.state.sndr,
        rcvr: this.state.rcvr,
        amt: this.state.amt,
        txId: this.state.txId},
        signedData: this.state.signedData,
    }
    this.getKeys()
      .then(e=>{
        dataToBeSent.sndrPubKey = e.sndr;
        dataToBeSent.rcvrPubKey = e.rcvr;

        console.log(dataToBeSent)

        axios({
          method: 'post',
          url: `http://localhost:${port}/transfer/`,
          data: dataToBeSent,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }).then(e=>{
          console.log(e)
          console.log(JSON.stringify(e))
        })
        .catch(e=>{
          console.log(e)
          console.log('askdjasdj')
        })

      })
    return
  }

  render(){
    return(
  <div>
    <article className="cf ph3 ph5-ns pv5">
  <header className="fn fl-ns w-50-ns pr4-ns">
    <h1 className="f2 lh-title fw9 mb3 mt0 pt3 bt bw2"> Transfer </h1>
    <h2 className="f3 mid-gray lh-title"> Send money to someone p2p </h2>
    <div style={{width: '100%', overflow: 'auto'}}>
    <pre 
      id="metadata">{JSON.stringify({
        'sndr': this.state.sndr,
        'rcvr': this.state.rcvr,
        'amt': this.state.amt,
        'txId': this.state.txId,
      })}</pre>
    </div>
    <button onClick={this.copyMetaData}>Copy Metadata</button>
    <h2 className="f3 mid-gray lh-title"> Copy this, Sign it using your Private Key and paste it back in Signed Metadata field</h2>
  </header>
  <div className="fn fl-ns w-50-ns">
    <form className="pa4 black-80">
      <div className="measure">

        <label htmlFor="sndr" className="f6 b db mb2">
            Sender Username
            <span className="normal black-60">(keybase)</span>
        </label>
        <input 
          id="sndr" 
          value={this.state.sndr}
          className="input-reset ba b--black-20 pa2 mb2 db w-100"
          type="text"
          onChange={this.handleSndrChange}
          aria-describedby="name-desc"/>

        <label htmlFor="rcvr" className="f6 b db mb2">
           Reciever Username
           <span className="normal black-60">(keybase)</span>
        </label>
        <input 
          id="rcvr"
          value={this.state.rcvr}
          className="input-reset ba b--black-20 pa2 mb2 db w-100"
          type="text"
          onChange={this.handleRcvrChange}
          aria-describedby="name-desc"/>

        <label htmlFor="amt" className="f6 b db mb2">
          Amount<span className="normal black-60">(in tokens)</span>
        </label>
        <input 
          id="amt"
          value={this.state.amt}
          className="input-reset ba b--black-20 pa2 mb2 db w-100"
          type="number"
          min='1'
          onChange={this.handleAmtChange}
          aria-describedby="name-desc"/>

        <label htmlFor="signedData" className="f6 b db mb2">
          Signed Metadata<span className="normal black-60">(in tokens)</span>
        </label>
        <textarea 
          id="signedData" 
          className="input-reset ba b--black-20 pa2 mb2 db w-100" 
          value={this.state.signedData}
          onChange={this.handleSignedDataChange}
          type="text" 
          aria-describedby="name-desc"/>
        <small id="signedData-desc" className="f6 black-60 db mb2">Paste the signed metadata.</small>
        <input type="submit" onClick={this.handleSubmit} value="Generate Transaction" />
      </div>
    </form>
  </div>
</article>


  </div>

    )
  }
}

export default Transfer
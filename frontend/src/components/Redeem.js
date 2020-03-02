import React, { Component } from 'react';
const jsonData = require('./data.json')
const jd = jsonData.data
console.log(jd.encR)
const axios = require('axios')
const port = 8000;

class Redeem extends Component {

  constructor(props) {
    super(props);
    this.state = {tempPubKey: ''}
    this.handleTempPubKey = this.handleTempPubKey.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() { }

  handleSubmit(event) {
    event.preventDefault();
    axios({
      method: 'post',
      url: `http://localhost:${port}/redeem/`,
      data: {tempPubKey: this.state.tempPubKey, encData: jd.encT, metadata: jd.metadata},
      headers: { 'Access-Control-Allow-Origin': '*' },
    }).then(e=>{
      console.log(e)
    })
    .catch(e=>{
      console.log(e)
    })
    return
  }

  handleTempPubKey(event) {
    this.setState({tempPubKey: event.target.value});
  }

  render(){
    return(
  <div>
    <article className="cf ph3 ph5-ns pv5">
  <header className="fn fl-ns w-50-ns pr4-ns">
    <h1 className="f2 lh-title fw9 mb3 mt0 pt3 bt bw2"> Redeem </h1>
    <h2 className="f3 mid-gray lh-title"> Get the greens </h2>
    <div style={{width: '100%', overflow: 'auto'}}>
    </div>
  </header>
  <div className="fn fl-ns w-50-ns">
    <form className="pa4 black-80">
      <div className="measure">

        <label htmlFor="key" className="f6 b db mb2">
            Enter whatever you got after decrypting encR with your private key
        </label>
        <textarea 
          id="tempPubKey" 
          onChange={this.handleTempPubKey}
          value={this.state.tempPubKey}
          className="input-reset ba b--black-20 pa2 mb2 db w-100"
          type="text"
          aria-describedby="tempPubKey-desc"/>
        <input type="submit" onClick={this.handleSubmit} value="Give my monie" />
      </div>
    </form>
  </div>
</article>


  </div>

    )
  }
}

export default Redeem
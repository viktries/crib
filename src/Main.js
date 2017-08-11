import React, { Component } from 'react'
import axios from 'axios'
import ReactFileReader from 'react-file-reader'
import ReactDOM from 'react-dom'
import RaisedButton from 'material-ui/RaisedButton'
import injectTapEventPlugin from 'react-tap-event-plugin'
import JsonTable from './rts.js'
import MenuItem from 'material-ui/MenuItem'
import Dropdown from './dropdown.js'
 
// Needed for onTouchTap 
// http://stackoverflow.com/a/34015469/988941 
injectTapEventPlugin()

class Main extends Component {
  constructor(props) {
    super(props)
    this.handleFiles = this.handleFiles.bind(this)
    this.showContents = this.showContents.bind(this)
    this.wipeDB = this.wipeDB.bind(this)
  }
  componentDidMount() {
    this.showContents()
  }
  wipeDB() {
    var url = this.props.url
    axios.get(url+'/wipe')
      .then(function (response) {
        updateTable(response, url)
      })
      .catch(err => {
        console.log(err)
      })
  }
  handleFiles(files) {
    var reader = new FileReader()
    var url = this.props.url
    reader.onload = function(e) {
      axios.post(url+'/csv', {data: reader.result})
      .then(function (response) {
        updateTable(response, url)
      })
      .catch(err => {
        console.log(err)
      })
    }
    reader.readAsText(files[0])
  }
  showContents(files) {
    var url = this.props.url
    axios.get(url + '/data')
      .then(function (response) {
        updateTable(response, url)
      })
      .catch(err => {
        console.log(err)
      })
  }
  render() {
    return (
      <div>
        <p>Intro Put CSV stuff into Mongo, then etc, WAit until Table Appears</p>
        <RaisedButton type="button" onClick={this.wipeDB}>Start Fresh, Wipe DB</RaisedButton>
        <ReactFileReader handleFiles={this.handleFiles} fileTypes={'.csv'}>
          <RaisedButton className='btn'>Upload CSV to DB for Training & Validation Set (Limit: 50MB)</RaisedButton>
        </ReactFileReader>
        <div id='table'/>
        <div id='train'/>
      </div>
    )
  }

}

function updateTable(response, url) {
  var first = response.data[0]
  ReactDOM.render(
          <JsonTable rows={ response.data } />,
          document.getElementById('table')
        )
  if (first != null) {
    var keys = Object.keys(first)
    var items = []
    for (let i = 0; i < keys.length; i++) {
      items.push(<MenuItem value={keys[i]} key={keys[i]} primaryText={`${keys[i]}`} />)
    }
    ReactDOM.render(
      <Dropdown items={items} url={url}>
          {items}
        
        </Dropdown>
      ,
      document.getElementById('train')
    )
  }
}

export default Main

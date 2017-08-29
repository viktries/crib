import React, { Component } from 'react'
import axios from 'axios'
import ReactFileReader from 'react-file-reader'
import ReactDOM from 'react-dom'
import RaisedButton from 'material-ui/RaisedButton'
import injectTapEventPlugin from 'react-tap-event-plugin'
import JsonTable from './rts.js'
import MenuItem from 'material-ui/MenuItem'
import Dropdown from './dropdown.js'
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer'
import styles from './style.css';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';
 
// Needed for onTouchTap 
// http://stackoverflow.com/a/34015469/988941 
injectTapEventPlugin()

class Main extends Component {
  constructor(props) {
    super(props)
    this.handleFiles = this.handleFiles.bind(this)
    this.showContents = this.showContents.bind(this)
    this.wipeDB = this.wipeDB.bind(this)
    this.state = {open: false}
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
  handleToggle = () => this.setState({open: !this.state.open});
  handleClose = () => this.setState({open: false})
  render() {
    return (
      <div>
        <AppBar
          onLeftIconButtonTouchTap={this.handleToggle}
          title="Upload CSV, Select Param to Train & Predict w/o that Label (Ex: foreveralone.csv then genderless.csv)"
        />
        <Drawer open={this.state.open} 
          docked={false}>
          <MenuItem onClick={this.handleClose}>TODO: </MenuItem>
          <MenuItem onClick={this.handleClose}>visualize algorithms & accuracies </MenuItem>
          <MenuItem onClick={this.handleClose}>more options for algorithms</MenuItem >
          <MenuItem onClick={this.handleClose}>allow tuning hyperparameters </MenuItem>
        </Drawer>
        <div id='table'/>
        <Toolbar>
        <ToolbarGroup firstChild={true}>
        <RaisedButton secondary={true} type="button" onClick={this.wipeDB} label="Start Fresh, Wipe DB"/>
        <ReactFileReader handleFiles={this.handleFiles} fileTypes={'.csv'}>
          <RaisedButton secondary={true} className='btn' label="Upload CSV to DB for Training & Validation Set (Limit: 50MB)"/>
        </ReactFileReader>
        </ToolbarGroup></Toolbar>
        <div id='predTable'/>
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
      <Dropdown items={items} url={url} style='width:200'>
          {items}
        
        </Dropdown>
      ,
      document.getElementById('train')
    )
  }
}

export default Main

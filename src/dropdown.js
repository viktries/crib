import React from 'react'
import axios from 'axios'
import ReactDOM from 'react-dom'
import SelectField from 'material-ui/SelectField'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import RaisedButton from 'material-ui/RaisedButton'
import ReactFileReader from 'react-file-reader'
import JsonTable from 'react-json-table';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';

class Dropdown extends React.Component {

  constructor(props) {
    super(props)
    this.train = this.train.bind(this)
    this.handleFiles = this.handleFiles.bind(this)
    this.state = {}
  }
  handleFiles(files) {
    var reader = new FileReader()
    var url = this.props.url
    reader.onload = function(e) {
      axios.post(url+'/test', {data: reader.result})
      .then(function (response) {
        // updateTable(response, url)
        ReactDOM.render(
          <JsonTable rows={ response.data } />,
          document.getElementById('predTable')
        )
      })
      .catch(err => {
        console.log(err)
      })
    }
    reader.readAsText(files[0])
  }
  handleChange = (event, index, value) => {
    this.setState({value})
  }
  train() {
    var url = `${this.props.url}/train`
    axios.post(url, {data: this.state.value})
      .then(function (response) {
        ReactDOM.render(
      <p>{response.data}</p>
      ,
      document.getElementById('results')
    )
      })
      .catch(err => {
        console.log(err)
      })
  }
  render() {
    return (
      <MuiThemeProvider>
      <div>
      <Toolbar>
        <ToolbarGroup firstChild={true}>
        <SelectField value={this.state.value} onChange={this.handleChange} floatingLabelText="Param to Train">
          {this.props.items}
        </SelectField>
        <ReactFileReader handleFiles={this.handleFiles} fileTypes={'.csv'}>
          <RaisedButton secondary={true} className='btn' label="Upload CSV to Predict"/>
        </ReactFileReader>
        <RaisedButton primary={true} onClick={this.train} label="Train Log Regression on Param"/>
        </ToolbarGroup></Toolbar>
       </div>
      </MuiThemeProvider>
    )
  }
}

export default Dropdown
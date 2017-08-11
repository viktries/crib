import React from 'react'
import axios from 'axios'
import ReactDOM from 'react-dom'
import DropDownMenu from 'material-ui/DropDownMenu'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import RaisedButton from 'material-ui/RaisedButton'
import ReactFileReader from 'react-file-reader'


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
        alert("so close")
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
        <DropDownMenu value={this.state.value} onChange={this.handleChange}>
          {this.props.items}
        </DropDownMenu>
        <ReactFileReader handleFiles={this.handleFiles} fileTypes={'.csv'}>
          <RaisedButton className='btn'>Upload CSV to Predict</RaisedButton>
        </ReactFileReader>
        <RaisedButton onClick={this.train}>Train Log Regression on Param</RaisedButton>
       </div>
      </MuiThemeProvider>
    )
  }
}

export default Dropdown
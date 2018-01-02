import React from 'react';
import ReactDOM from 'react-dom';
import Main from './Main';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'; 

ReactDOM.render(
  <MuiThemeProvider>
    <Main 
      url='http://localhost:3001'/>
  </MuiThemeProvider>,
  document.getElementById('root')
);
import React from 'react';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter } from 'react-router-dom';
import DateFnsUtils from '@date-io/date-fns';
import muiTheme from './muiTheme';
import Routes from './Routes';


function App() {
  return (
    <BrowserRouter>
      <MuiThemeProvider theme={muiTheme}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Routes />
        </MuiPickersUtilsProvider>
      </MuiThemeProvider>
    </BrowserRouter>
  );
}

export default App;

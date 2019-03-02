import React from 'react';
import { withSnackbar } from 'snackbar';

function Simple() {
  return <span>My simple text</span>;
}

export default withSnackbar(Simple);

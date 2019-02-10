import React from 'react';
import { withSnackbar } from 'snackbar';

const Simple = () => (
  <span>My simple text</span>
);

export default withSnackbar(Simple);

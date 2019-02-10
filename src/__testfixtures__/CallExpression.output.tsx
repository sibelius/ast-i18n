import { withTranslation } from 'react-i18next';
const callIt = ({ showSnackbar }) => {
  showSnackbar({ message: t('user_editted_successfully')});
};

export default withTranslation()(callIt);

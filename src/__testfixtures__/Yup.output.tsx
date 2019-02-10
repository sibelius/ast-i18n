import { withFormik } from 'formik';
import * as yup from 'yup';

const UserInnerForm = () => (
  <span>{t('user_form_here')}</span>
);

type Values = {
  name: string,
  email: string,
}
const UserForm = withFormik({
  validationSchema: yup.object().shape({
    name: yup.string().required(t('name_is_required')),
    email: yup.string().required(t('email_is_required')),
  }),
  handleSubmit: (values: Values, formikBag) => {
    const { props } = formikBag;
    const { showSnackbar } = props;

    showSnackbar({ message: t('user_editted_successfully')});
  },
})(UserInnerForm);

export default UserForm;

import React from 'react';

import { withTranslation } from 'react-i18next';

class MyClass extends React.Component {
  render() {
    const { t } = this.props;
    return (
      <div>
        <span>{t('my_great_class_component')}</span>
      </div>
    );
  }
}

export default withTranslation()(MyClass);

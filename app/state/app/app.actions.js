import { Toast } from 'native-base';

export const showToast = toast => () => {
  Toast.show(toast);
};

/* eslint-disable prettier/prettier */
import {Platform, BackHandler} from 'react-native';
import Global from './global';
let currentCount = 0;
export const useDoubleBackPressExit = (exitHandler: () => void) => {
  if (Platform.OS === 'ios') {
    return;
  }
  const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
    if (currentCount === 1) {
      exitHandler();
      subscription.remove();
      BackHandler.exitApp();
      return true;
    }
    backPressHandler();
    return true;
  });
};
const backPressHandler = () => {
  if (currentCount < 1) {
    currentCount += 1;
    Global.toasterMessage('Press again to close!');
  }
  setTimeout(() => {
    currentCount = 0;
  }, 500);
};

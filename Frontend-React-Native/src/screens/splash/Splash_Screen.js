/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  Image,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Text,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {StackActions} from '@react-navigation/native';
import Global from '../../services/global';

export default class Splash_Screen extends Component {
  constructor() {
    super();
    this.state = {
      phone: '',
      password: '*******',
      isEditable: false,
    };
    console.log('Splash Screen');
    this._bootstrapAsync();
  }
  async _bootstrapAsync() {
    setTimeout(async () => {
      console.log(await Global.isLoggedIn());
      if (await Global.isLoggedIn()) {
        this.props.navigation.dispatch(StackActions.replace('Home'));
      } else {
        this.props.navigation.dispatch(StackActions.replace('Auth'));
      }
    }, 1500);
  }
  render() {
    return (
      <View>
        <ImageBackground
          style={styles.imgContainer}
          style={{width: '100%', height: '100%'}}
          source={require('../../assets/logo/dailykart.jpg')}>
          <View style={styles.mainContainer}>
            <Image
              style={{width: wp(25), height: hp(10)}}
              source={require('../../assets/logo/ind-flag.png')}
            />
            <Text
              style={{fontSize: wp(5), fontWeight: 'bold', marginTop: hp(1)}}>
              Automatic Vaccine Booking
            </Text>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  imgContainer: {
    height: '100%',
    width: '100%',
  },
  mainContainer: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255,.8)',
  },
});

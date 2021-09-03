/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
  ImageBackground,
} from 'react-native';
import {Picker} from '@react-native-community/picker';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import CardView from 'react-native-cardview';
import Icon from 'react-native-vector-icons/FontAwesome';
import Color from '../../services/color';
import PasswordInputText from 'react-native-hide-show-password-input';
import Global from '../../services/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {StackActions} from '@react-navigation/native';

export default class Register extends Component {
  constructor() {
    super();
    this.state = {
      spinner: false,
      editable: true,
      name: '',
      email: '',
      gender: 'M',
      pass: '',
      confirmPass: '',
    };
  }
  async onSubmit() {
    let name = this.state.name;
    if (name && name.includes(' ') && name.split(' ')[1]) {
      if (
        this.state.email &&
        this.state.email.includes('@') &&
        this.state.email.includes('.')
      ) {
        if (this.state.pass) {
          if (this.state.confirmPass) {
            if (this.state.confirmPass === this.state.pass) {
              let param = {
                reqType: 'signup',
                fName: name.split(' ')[0],
                mName:
                  name && name.split(' ') && name.split(' ').length === 3
                    ? name.split(' ')[1]
                    : '',
                lName:
                  name && name.split(' ') && name.split(' ').length === 3
                    ? name.split(' ')[2]
                    : name.split(' ')[1],
                gender: this.state.gender,
                ph: await AsyncStorage.getItem('ph'),
                email: this.state.email,
                password: this.state.pass,
              };
              this.setState({spinner: true});
              await axios
                .post(Global.apiURL + 'auth/sign-upin', param)
                .then(async response => {
                  console.log(response.data);
                  if (
                    response.data &&
                    response.data.status &&
                    response.data.data
                  ) {
                    this.setState({spinner: false});
                    await AsyncStorage.setItem('_id', response.data.data._id);
                    await AsyncStorage.setItem(
                      'name',
                      response.data.data.fName +
                        response.data.data.fName +
                        (response.data.data.mName &&
                        response.data.data.mName !== ''
                          ? ' ' + response.data.data.mName + ' '
                          : ' ') +
                        response.data.data.lName,
                    );
                    await AsyncStorage.setItem(
                      'email',
                      response.data.data.email,
                    );
                    await AsyncStorage.setItem(
                      'gender',
                      response.data.data.gender,
                    );
                    await AsyncStorage.setItem(
                      'cartList',
                      response.data.data.cart,
                    );
                    await AsyncStorage.setItem(
                      'wishList',
                      response.data.data.wishlist,
                    );
                    this.props.navigation.dispatch(
                      StackActions.replace('Home'),
                    );
                  }
                })
                .catch(err => {
                  this.setState({spinner: false});
                  console.log(err.response.data);
                  Global.toasterMessage(err.response.data.message);
                });
            } else {
              Global.toasterMessage(
                'Your pssword and confirm password need to be same',
                'long',
              );
            }
          } else {
            Global.toasterMessage('Provide your confirm password', 'long');
          }
        } else {
          Global.toasterMessage('Provide your password', 'long');
        }
      } else {
        Global.toasterMessage('Provide your valid email', 'long');
      }
    } else {
      Global.toasterMessage('Provide your full name', 'long');
    }
  }
  render() {
    return (
      <ImageBackground
        style={styles.mainContainer}
        source={require('../../assets/images/registration-background.png')}>
        <CardView
          style={{
            width: wp(85),
            // height: hp(80),
            backgroundColor: 'white',
          }}
          cardElevation={10}
          cardMaxElevation={2}
          cornerRadius={20}>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
            <Text style={styles.header}>Registration</Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon name="user" size={25} color={Color.primary} />
              <TextInput
                style={styles.input}
                placeholder="Enter Your Name"
                value={this.state.name}
                placeholderTextColor="grey"
                editable={this.state.editable}
                onChangeText={input => {
                  this.setState({name: input});
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon
                style={{position: 'relative', right: wp(2)}}
                name="transgender-alt"
                size={20}
                color={Color.primary}
              />
              <View style={{borderWidth: 1, borderRadius: 5}}>
                <Picker
                  selectedValue={this.state.gender}
                  style={{
                    width: wp(70),
                    height: 40,
                  }}
                  onValueChange={(itemValue, itemIndex) => {
                    this.setState({gender: itemValue});
                  }}>
                  <Picker.Item label="Male" value="M" />
                  <Picker.Item label="Female" value="F" />
                  <Picker.Item label="Others" value="O" />
                </Picker>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon name="envelope" size={20} color={Color.primary} />
              <TextInput
                style={styles.input}
                value={this.state.email}
                placeholder="Enter Your Email"
                placeholderTextColor="grey"
                keyboardType="email-address"
                editable={this.state.editable}
                onChangeText={input => {
                  this.setState({email: input});
                }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon name="lock" size={25} color={Color.primary} />
              <PasswordInputText
                label={'Enter Your Password'}
                getRef={input => (this.input = input)}
                value={this.state.pass}
                onChangeText={password => this.setState({pass: password})}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon name="lock" size={25} color={Color.primary} />
              <PasswordInputText
                label={'Enter Your Confirm Password'}
                getRef={input => (this.input = input)}
                value={this.state.confirmPass}
                onChangeText={password =>
                  this.setState({confirmPass: password})
                }
              />
            </View>
            <View style={{height: hp(10)}}>
              {this.state.spinner ? (
                <ActivityIndicator size="large" color={Color.primary} />
              ) : (
                <TouchableOpacity
                  style={{width: wp(75), marginLeft: wp(5), marginTop: hp(2)}}>
                  <Button
                    title="Submit"
                    color={Color.primary}
                    onPress={() => {
                      console.log('Submit');
                      this.onSubmit();
                    }}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </CardView>
      </ImageBackground>
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
  header: {
    fontSize: 30,
    alignSelf: 'center',
    marginTop: hp(2),
    marginBottom: hp(1),
    // color: 'white',
  },
  input: {
    width: wp(70),
    height: 40,
    color: 'black',
    backgroundColor: 'white',
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 5,
    margin: hp(1),
  },
});

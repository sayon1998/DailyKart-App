
import axios from 'axios';
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
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Global from '../../services/global';
import CardView from 'react-native-cardview';
import Icon from 'react-native-vector-icons/FontAwesome';
import Color from '../../services/color';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PasswordInputText from 'react-native-hide-show-password-input';
import auth from '@react-native-firebase/auth';
import {StackActions} from '@react-navigation/native';

export default class Auth extends Component {
  constructor() {
    super();
    this.state = {
      spinner: false,
      editable: true,
      isOTP: false,
      isProceed: false,
      isPass: false,
      isNewUser: false,
      ph: null,
      pass: '',
      otpSec: 30,
      codeInput: '',
      autoVerify: false,
    };
  }
  async onSubmit() {
    console.log(this.state.ph);
    if (this.state.ph && this.state.ph.length === 10) {
      this.setState({spinner: true});
      try {
        await axios
          .post(Global.apiURL + 'auth/check-phnumber-availability', {
            ph: this.state.ph,
          })
          .then(async response => {
            console.log(response.data);
            this.setState({spinner: false});
            if (!response.data.status) {
              this.setState({isProceed: true, editable: false});
              await AsyncStorage.setItem('_id', response.data.data._id);
              await AsyncStorage.setItem('ph', response.data.data.ph);
              await AsyncStorage.setItem(
                'name',
                response.data.data.fName +
                  (response.data.data.mName && response.data.data.mName !== ''
                    ? ' ' + response.data.data.mName + ' '
                    : ' ') +
                  response.data.data.lName,
              );
              await AsyncStorage.setItem(
                'cartList',
                JSON.stringify(response.data.data.cart),
              );
              await AsyncStorage.setItem(
                'wishList',
                JSON.stringify(response.data.data.wishlist),
              );
              await AsyncStorage.setItem('email', response.data.data.email);
              await AsyncStorage.setItem('gender', response.data.data.gender);
            } else {
              // Navigate to Register Page
              await AsyncStorage.setItem('ph', this.state.ph);
              this.setState({
                isNewUser: true,
                isProceed: true,
                editable: false,
                isOTP: true,
              });
              this.signInWithPhone();
              // this.props.navigation.navigate('register');
            }
          })
          .catch(err => {
            this.setState({spinner: false});
            Global.toasterMessage(err.response.data.message);
          });
      } catch (error) {
        Global.toasterMessage(error.message);
      }
    } else {
      Global.toasterMessage('Enter valid phone number!');
    }
  }
  async onLogin() {
    if (this.state.ph && this.state.ph.length === 10) {
      this.setState({spinner: true});
      let param = {
        reqType: 'signin',
        email: '',
        ph: this.state.ph,
        password: this.state.pass,
      };
      await axios
        .post(Global.apiURL + 'auth/sign-upin', param)
        .then(async response => {
          console.log(response.data);
          if (response.data && response.data.status && response.data.data) {
            this.setState({spinner: false});
            this.props.navigation.dispatch(StackActions.replace('Home'));
          }
        })
        .catch(err => {
          this.setState({spinner: false});
          Global.toasterMessage(err.response.data.message);
          console.log(err.response.data);
        });
    } else {
      Global.toasterMessage('Enter valid phone number!');
    }
  }
  // OTP send
  async signInWithPhone() {
    try {
      Global.toasterMessage(
        `OTP is send successfully to ${this.state.ph}`,
        'long',
      );
      this.setState({otpSec: 30});
      this.setInterval = setInterval(() => {
        if (this.state.otpSec > 0) {
          this.setState({otpSec: this.state.otpSec - 1});
        } else {
          clearInterval(this.setInterval);
        }
      }, 1000);
      await auth()
        .verifyPhoneNumber('+91' + this.state.ph, 10)
        .then(confirmation => {
          console.log(JSON.stringify(confirmation));
          this.setState({confirmation: confirmation});
          this.setState({otpSec: 30, spinner: false});
          if (confirmation && confirmation.code && confirmation.code !== null) {
            if (
              confirmation &&
              confirmation.state &&
              confirmation.state === 'verified'
            ) {
              this.setState({codeInput: confirmation.code, autoVerify: true});
              Global.toasterMessage('Auto detecting OTP', 'long');
              this.setState({spinner: true});
              var that = this;
              setTimeout(async function () {
                that.setState({spinner: false});
                Global.toasterMessage('Verification Successful', 'long');
                if (that.state.isNewUser) {
                  await AsyncStorage.setItem('ph', that.state.ph);
                  that.props.navigation.navigate('register');
                } else {
                  await AsyncStorage.setItem('ph', that.state.ph);
                  Global.toasterMessage('Login Successful !', 'long');
                  that.props.navigation.dispatch(StackActions.replace('Home'));
                }
              }, 1500);
            }
          }
        })
        .catch(error => {
          console.error(error);
          if (
            error &&
            error.message &&
            error.message.includes('auth/too-many-requests')
          ) {
            Global.toasterMessage(
              'We have blocked all requests from this device due to unusual activity. Try again later.',
              'long',
            );
          } else if (
            error &&
            error.message &&
            error.message.includes('auth/unknown')
          ) {
            Global.toasterMessage('An internal error has occurred.', 'long');
          }
        });
    } catch (error) {
      console.error(error);
      if (
        error &&
        error.message &&
        error.message.includes('auth/too-many-requests')
      ) {
        Global.toasterMessage(
          'We have blocked all requests from this device due to unusual activity. Try again later.',
          'long',
        );
      }
    }
  }
  // Confirm OTP
  async confirmCode() {
    this.setState({spinner: true});
    const {confirmation} = this.state;
    try {
      console.log(this.state.codeInput.length);
      if (
        confirmation &&
        this.state.codeInput &&
        this.state.codeInput.length === 6
      ) {
        this.setState({spinner: true});
        const credential = auth.PhoneAuthProvider.credential(
          confirmation.verificationId,
          this.state.codeInput,
        );
        if (credential) {
          await auth()
            .signInWithCredential(credential)
            .then(userCredential => {
              console.log('U_Credential', userCredential);
              Global.toasterMessage('Verifying OTP');
              this.setState({spinner: true});
              var that = this;
              setTimeout(async function () {
                that.setState({spinner: false});
                Global.toasterMessage('Verification Successful', 'long');
                if (that.state.isNewUser) {
                  await AsyncStorage.setItem('ph', that.state.ph);
                  that.props.navigation.navigate('register');
                } else {
                  await AsyncStorage.setItem('ph', that.state.ph);
                  Global.toasterMessage('Login Successful !', 'long');
                  that.props.navigation.dispatch(StackActions.replace('Home'));
                }
              }, 1500);
            })
            .catch(error => {
              this.setState({spinner: false});
              console.log(error);
              if (
                error &&
                error.message &&
                error.message.includes('auth/invalid-verification-code')
              ) {
                Global.toasterMessage('Invalid OTP', 'long');
              } else {
                Global.toasterMessage('Error Occurred', 'long');
              }
            });
        } else {
          this.setState({spinner: false});
          Global.toasterMessage('Invalid OTP', 'long');
        }
      }
    } catch (error) {
      console.error(error);
      this.setState({spinner: false});
      Global.toasterMessage(
        error.message.split(']').join('').split('[').join(''),
        'long',
      );
    }
  }
  async componentWillUnmount() {
    this.setState({
      spinner: false,
      editable: true,
      isOTP: false,
      isProceed: false,
      isPass: false,
      isNewUser: false,
      ph: null,
      pass: '',
      otpSec: 30,
      codeInput: '',
      autoVerify: false,
    });
  }
  render() {
    return (
      <ImageBackground
        style={styles.mainContainer}
        source={require('../../assets/images/background.png')}>
        <CardView
          style={{
            width: wp(85),
            height:
              this.state.isOTP && this.state.isProceed
                ? hp(35)
                : this.state.isPass && this.state.isProceed
                ? null
                : hp(27),
            // backgroundColor: '#a58bb0',
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
            <Text style={styles.header}>DailyKart</Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon name="phone" size={25} color={Color.primary} />
              <TextInput
                style={styles.input}
                value={this.state.ph}
                placeholder="Enter Phone Number"
                placeholderTextColor="grey"
                keyboardType="number-pad"
                editable={this.state.editable}
                onChangeText={input => {
                  if (input && input.length === 10) {
                    Keyboard.dismiss(0);
                  }
                  this.setState({ph: input});
                }}
              />
            </View>
            {this.state.isPass && this.state.isProceed ? (
              <View style={{flexDirection: 'column'}}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Icon name="shield" size={25} color={Color.primary} />
                  <PasswordInputText
                    getRef={input => (this.input = input)}
                    value={this.state.pass}
                    onChangeText={password => this.setState({pass: password})}
                  />
                </View>
                {this.state.spinner ? null : (
                  <View
                    style={{
                      height: hp(10),
                    }}>
                    <TouchableOpacity
                      touchSoundDisabled={false}
                      onPress={() => {
                        console.log('Login');
                        this.onLogin();
                      }}
                      style={styles.btnContainer}>
                      <Text style={styles.btnText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      touchSoundDisabled={false}
                      onPress={() => {
                        this.setState({isOTP: true, isPass: false});
                        console.log('Verify Using OTP');
                      }}
                      style={[
                        styles.btnContainer,
                        {backgroundColor: Color.warn},
                      ]}>
                      <Text style={styles.btnText}>Verify Using OTP</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : null}
            {this.state.isOTP && this.state.isProceed ? (
              <View
                style={{
                  marginTop: hp(1),
                  marginBottom: hp(1),
                  marginLeft: hp(2),
                  marginRight: hp(2),
                  height: 30,
                }}>
                <Text style={{alignSelf: 'center', fontSize: 15}}>
                  Enter your OTP here
                </Text>
                <OTPInputView
                  pinCount={6}
                  placeholderCharacter="0"
                  placeholderTextColor="black"
                  keyboardType="number-pad"
                  code={this.state.codeInput} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
                  onCodeChanged={code => {
                    this.setState({codeInput: code});
                    if (
                      !this.state.autoVerify &&
                      this.state.codeInput &&
                      this.state.codeInput.length === 6
                    ) {
                      this.confirmCode();
                    }
                  }}
                  autoFocusOnLoad
                  codeInputFieldStyle={styles.underlineStyleBase}
                  codeInputHighlightStyle={styles.underlineStyleHighLighted}
                  onCodeFilled={codeInput => {
                    this.setState({codeInput: codeInput});
                    console.log(`Code is ${codeInput}, you are good to go!`);
                  }}
                />
                <Text
                  style={{
                    alignSelf: 'center',
                    marginTop: hp(1.5),
                  }}>
                  {'00:' + this.state.otpSec} sec
                </Text>
                {this.state.spinner ? (
                  <ActivityIndicator
                    style={{marginTop: hp(2)}}
                    size="large"
                    color={Color.primary}
                  />
                ) : (
                  <View style={{flexDirection: 'column'}}>
                    <View
                      style={{
                        width: '100%',
                        height: '100%',
                        marginTop: hp(1),
                        flexDirection: 'row',
                        justifyContent: this.state.isNewUser
                          ? 'center'
                          : 'space-between',
                      }}>
                      {!this.state.isNewUser ? (
                        <TouchableOpacity style={{width: '45%'}}>
                          <Button
                            title="Use Password"
                            color={Color.warn}
                            onPress={() => {
                              this.setState({
                                isPass: true,
                                isOTP: false,
                                isProceed: true,
                              });
                              console.log('Use Password');
                            }}
                          />
                        </TouchableOpacity>
                      ) : null}
                      {this.state.otpSec === 0 ? (
                        <TouchableOpacity style={{width: '45%'}}>
                          <Button
                            title="Resend OTP"
                            color={Color.primary}
                            onPress={() => {
                              console.log('Resend OTP');
                              this.setState({spinner: true});
                              this.signInWithPhone();
                            }}
                          />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                )}
                {!this.state.spinner ? (
                  <View style={{marginTop: this.state.isPass ? hp(2) : hp(0)}}>
                    <TouchableOpacity
                      onPress={() => {
                        console.log('Skip now');
                        this.props.navigation.dispatch(
                          StackActions.replace('Home'),
                        );
                      }}>
                      <Text style={styles.skip}>{'< Skip now >'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={{height: hp(10)}}>
                {this.state.spinner ? (
                  <ActivityIndicator size="large" color={Color.primary} />
                ) : !this.state.isProceed ? (
                  <TouchableOpacity
                    touchSoundDisabled={false}
                    onPress={() => {
                      this.onSubmit();
                    }}
                    style={styles.btnContainer}>
                    <Text style={styles.btnText}>Proceed</Text>
                  </TouchableOpacity>
                ) : !this.state.isOTP && !this.state.isPass ? (
                  <View
                    style={{
                      marginTop: hp(1),
                      marginLeft: hp(2),
                      marginRight: hp(2),
                      flexDirection: 'row',
                      justifyContent: 'space-evenly',
                    }}>
                    <TouchableOpacity
                      style={{
                        width: '50%',
                        marginRight: hp(2),
                      }}>
                      <Button
                        title="OTP Verify"
                        color={Color.warn}
                        onPress={() => {
                          this.setState({isOTP: true});
                          console.log('OTP Verify');
                          this.signInWithPhone();
                        }}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={{width: '50%'}}>
                      <Button
                        title="Using Password"
                        color={Color.primary}
                        onPress={() => {
                          this.setState({isPass: true});
                          console.log('Using Password');
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                ) : null}
                {!this.state.spinner ? (
                  <View style={{marginTop: this.state.isPass ? hp(2) : hp(0)}}>
                    <TouchableOpacity
                      onPress={() => {
                        console.log('Skip now');
                        this.props.navigation.dispatch(
                          StackActions.replace('Home'),
                        );
                      }}>
                      <Text style={styles.skip}>{'< Skip now >'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        </CardView>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    fontSize: 30,
    alignSelf: 'center',
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  btnContainer: {
    backgroundColor: Color.primary,
    width: '90%',
    height: '50%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    borderWidth: 1,
    elevation: 10,
    marginTop: hp(1),
  },
  btnText: {
    fontSize: 18,
    color: 'white',
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
  mainContainer: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255,.8)',
  },
  skip: {
    fontSize: 18,
    color: Color.warn,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: hp(1.5),
  },
  underlineStyleBase: {
    borderWidth: 0,
    borderBottomWidth: 1,
    color: 'black',
    borderColor: 'black',
  },

  underlineStyleHighLighted: {
    borderColor: Color.primary,
  },
});

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
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {StackActions} from '@react-navigation/native';
import Global, {subscriber} from '../../services/global';
import Color from '../../services/color';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import RadioForm from 'react-native-simple-radio-button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CardView from 'react-native-cardview';
import CheckBox from '@react-native-community/checkbox';

export default class Profile extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      name: '',
      ph: '',
      email: '',
      gender: 'M',
      oldPassword: '',
      confirmPassword: '',
      newPassword: '',
      radio_props: [
        {label: 'Male', value: 'M', isChceked: true},
        {label: 'Female', value: 'F', isChceked: false},
        {label: 'Other', value: 'O', isChceked: false},
      ],
      cartItems: 0,
      wishItems: 0,
      orderPlaced: 0,
      savedAddress: 0,
      lastUsedAddress: {},
      lastPlacedOrder: {},
      changePassword: false,
      detailsLoader: false,
      formKey: Math.random(),
    };
  }
  componentDidMount() {
    // Commend in Production
    this.getUserDetails();
    // End Commend
    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      console.log('Profile listener');
      this.getUserDetails();
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
    this.setState({
      isLoading: true,
      name: '',
      ph: '',
      oldPassword: '',
      confirmPassword: '',
      newPassword: '',
      email: '',
      gender: 'M',
      radio_props: [
        {label: 'Male', value: 'M', isChceked: true},
        {label: 'Female', value: 'F', isChceked: false},
        {label: 'Other', value: 'O', isChceked: false},
      ],
      cartItems: 0,
      wishItems: 0,
      orderPlaced: 0,
      savedAddress: 0,
      lastUsedAddress: {},
      lastPlacedOrder: {},
      changePassword: false,
      detailsLoader: false,
      formKey: Math.random(),
    });
  }
  async getUserDetails() {
    this.setState({
      isLoading: true,
      name: '',
      ph: '',
      oldPassword: '',
      confirmPassword: '',
      newPassword: '',
      email: '',
      gender: 'M',
      radio_props: [
        {label: 'Male', value: 'M', isChceked: true},
        {label: 'Female', value: 'F', isChceked: false},
        {label: 'Other', value: 'O', isChceked: false},
      ],
      cartItems: 0,
      wishItems: 0,
      orderPlaced: 0,
      savedAddress: 0,
      lastUsedAddress: {},
      lastPlacedOrder: {},
      changePassword: false,
      detailsLoader: false,
      formKey: Math.random(),
    });
    if (await Global.isLoggedIn()) {
      await axios
        .get(
          Global.apiURL +
            `user/user-by-id/${await AsyncStorage.getItem('_id')}`,
        )
        .then(res => {
          if (res.data && res.data.status) {
            if (res.data.data) {
              this.setState({
                name:
                  res.data.data.fName +
                  (res.data.data.mName
                    ? ' ' + res.data.data.mName + ' '
                    : ' ') +
                  res.data.data.lName,
                ph: res.data.data.ph,
                email: res.data.data.email,
                gender: res.data.data.gender,
                cartItems: res.data.data.cartLength,
                wishItems: res.data.data.wishLength,
                orderPlaced: res.data.data.orderLength,
                savedAddress: res.data.data.addressLength,
                lastPlacedOrder: res.data.data.lastOrderDetails,
                lastUsedAddress: res.data.data.recentlyUsedAddress,
                isLoading: false,
              });
              let radioArray = this.state.radio_props;
              radioArray.forEach(e => {
                if (e.value === this.state.gender) {
                  e.isChceked = true;
                } else {
                  e.isChceked = false;
                }
              });
              this.setState({radio_props: radioArray});
            } else {
              this.setState({isLoading: false});
            }
          } else {
            this.setState({isLoading: false});
          }
        })
        .catch(err => {
          console.log(
            err &&
              err.response &&
              err.response.data &&
              err.response.data.message
              ? err.response.data.message
              : err.message,
          );
          this.setState({isLoading: false});
          Global.toasterMessage(
            err &&
              err.response &&
              err.response.data &&
              err.response.data.message
              ? err.response.data.message
              : err.message,
          );
        });
    }
  }
  async saveDetails() {
    if (this.state.changePassword) {
      console.log('Password Change');
      if (!this.state.oldPassword) {
        Global.toasterMessage('You have to enter your old password');
        return false;
      } else if (!this.state.newPassword) {
        Global.toasterMessage('You have to enter your new password');
        return false;
      } else if (this.state.newPassword && this.state.newPassword.length < 5) {
        Global.toasterMessage('Your password must be five letter long');
        return false;
      } else if (!this.state.confirmPassword) {
        Global.toasterMessage('You have to enter your confirm password');
        return false;
      } else if (this.state.oldPassword === this.state.newPassword) {
        Global.toasterMessage('Your old and new password can not be same');
        return false;
      } else if (this.state.newPassword !== this.state.confirmPassword) {
        Global.toasterMessage('Your New and Confirm password has to be same');
        return false;
      } else {
        let params = {
          _id: await AsyncStorage.getItem('_id'),
          oldpass: this.state.oldPassword,
          newpass: this.state.newPassword,
        };
        this.setState({detailsLoader: true});
        await axios
          .post(Global.apiURL + 'user/user-password-update', params)
          .then(res => {
            if (res.data && res.data.status) {
              if (res.data.data) {
                this.setState({
                  changePassword: false,
                  detailsLoader: false,
                  oldPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
              }
            } else {
              Global.toasterMessage(res.data.message);
              this.setState({detailsLoader: false});
            }
          })
          .catch(err => {
            console.log(
              err &&
                err.response &&
                err.response.data &&
                err.response.data.message
                ? err.response.data.message
                : err.message,
            );
            this.setState({detailsLoader: false});
          });
      }
    } else {
      console.log('Details Change');
      let oldName = await AsyncStorage.getItem('name'),
        oldPh = await AsyncStorage.getItem('ph'),
        oldEmail = await AsyncStorage.getItem('email'),
        oldgender = await AsyncStorage.getItem('gender');
      if (
        oldName === this.state.name &&
        oldPh === this.state.ph &&
        oldEmail === this.state.email &&
        oldgender === this.state.gender
      ) {
        Global.toasterMessage('You have not change anything yet.');
        return false;
      }
      if (!this.state.name) {
        Global.toasterMessage('User name is Required');
        return false;
      } else if (
        this.state.name &&
        (!this.state.name.includes(' ') || !this.state.name.split(' ')[1])
      ) {
        Global.toasterMessage('User name is not valid');
        return false;
      } else if (!this.state.ph) {
        Global.toasterMessage('Phone number is Required');
        return false;
      } else if (this.state.ph && this.state.ph.length !== 10) {
        Global.toasterMessage('Phone number is not valid');
        return false;
      } else if (!this.state.email) {
        Global.toasterMessage('Email is Required');
        return false;
      } else if (
        this.state.email &&
        (!this.state.email.includes('@') || !this.state.email.includes('.'))
      ) {
        Global.toasterMessage('Email is not valid');
        return false;
      } else {
        let name = this.state.name;
        let params = {
          _id: await AsyncStorage.getItem('_id'),
          fName: name.split(' ')[0],
          mName:
            name && name.split(' ') && name.split(' ').length === 3
              ? name.split(' ')[1]
              : '',
          lName:
            name && name.split(' ') && name.split(' ').length === 3
              ? name.split(' ')[2]
              : name.split(' ')[1],
          ph: this.state.ph,
          email: this.state.email,
          gender: this.state.gender,
        };
        this.setState({detailsLoader: true});
        await axios
          .post(Global.apiURL + 'user/user-details-update', params)
          .then(async res => {
            console.log(res.data);
            if (res.data && res.data.status) {
              if (res.data.data) {
                this.setState({
                  name:
                    res.data.data.fName +
                    (res.data.data.mName
                      ? ' ' + res.data.data.mName + ' '
                      : ' ') +
                    res.data.data.lName,
                  email: res.data.data.email,
                  ph: res.data.data.ph,
                  gender: res.data.data.gender,
                  detailsLoader: false,
                });
                await AsyncStorage.setItem('name', this.state.name);
                await AsyncStorage.setItem('ph', this.state.ph);
                await AsyncStorage.setItem('email', this.state.email);
                await AsyncStorage.setItem('gender', this.state.gender);
              }
            }
          })
          .catch(err => {
            this.setState({detailsLoader: false});
            console.log(
              err &&
                err.response &&
                err.response.data &&
                err.response.data.message
                ? err.response.data.message
                : err.message,
            );
          });
      }
    }
  }
  render() {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.imgContainer}>
          <Image
            style={styles.imageView}
            source={
              this.state.isLoading
                ? require('../../assets/images/avater.jpg')
                : {
                    uri: 'https://res.cloudinary.com/dzruu87x0/image/upload/v1622061302/ozem7yehty7bvo0y8qul.png',
                  }
            }
          />
          {!this.state.isLoading ? (
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="circle-edit-outline"
                color="white"
                size={30}
              />
            </View>
          ) : null}
        </View>

        {this.state.isLoading ? (
          <ActivityIndicator
            animating={true}
            style={{alignSelf: 'center'}}
            size="large"
            color={Color.primary}
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{flexDirection: 'column', margin: 5}}>
              <View style={styles.inputRow}>
                <Text style={styles.inputText}>Name:</Text>
                <TextInput
                  editable={
                    !this.state.changePassword && !this.state.detailsLoader
                  }
                  style={styles.input}
                  value={this.state.name}
                  placeholder="Enter Your Name"
                  placeholderTextColor="grey"
                  onChangeText={input => {
                    this.setState({name: input});
                  }}
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputText}>Email:</Text>
                <TextInput
                  editable={
                    !this.state.changePassword && !this.state.detailsLoader
                  }
                  style={styles.input}
                  value={this.state.email}
                  placeholder="Enter Your Email"
                  placeholderTextColor="grey"
                  onChangeText={input => {
                    this.setState({email: input});
                  }}
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputText}>Ph:</Text>
                <TextInput
                  editable={
                    !this.state.changePassword && !this.state.detailsLoader
                  }
                  style={styles.input}
                  value={this.state.ph}
                  placeholder="Enter Your Phone Number"
                  placeholderTextColor="grey"
                  onChangeText={input => {
                    this.setState({ph: input});
                  }}
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputText}>Gender:</Text>
                <RadioForm
                  style={{display: 'none', backgroundColor: 'white'}}
                  key={this.state.formKey}
                  formHorizontal={true}
                  buttonColor={'white'}
                  labelHorizontal={true}
                  radio_props={this.state.radio_props}
                  animation={true}
                  initial={this.state.gender}
                  onPress={value => {
                    if (
                      !this.state.changePassword ||
                      !this.state.detailsLoader
                    ) {
                      this.setState({gender: value});
                    }
                  }}
                />
                {this.state.radio_props.map((item, index) => {
                  return (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <CheckBox
                        key={index}
                        tintColors={{
                          true: Color.primary,
                        }}
                        disabled={
                          this.state.changePassword || this.state.detailsLoader
                        }
                        value={item.isChceked}
                        disabled={
                          item.isChceked ||
                          this.state.changePassword ||
                          this.state.detailsLoader
                        }
                        onValueChange={() => {
                          let radioArray = this.state.radio_props;
                          radioArray.forEach(e => {
                            if (e.value === item.value) {
                              e.isChceked = true;
                            } else {
                              e.isChceked = false;
                            }
                          });
                          this.setState({
                            gender: item.value,
                            radio_props: radioArray,
                          });
                        }}
                      />
                      <Text style={{fontSize: 16}}>{item.label}</Text>
                    </View>
                  );
                })}
              </View>
              {this.state.changePassword ? (
                <View>
                  <View style={styles.inputRow}>
                    <Text style={styles.inputText}>Old Pass:</Text>
                    <TextInput
                      style={[styles.input, {width: wp(70)}]}
                      value={this.state.oldPassword}
                      placeholder="Enter Your Old Password"
                      placeholderTextColor="grey"
                      onChangeText={input => {
                        this.setState({oldPassword: input});
                      }}
                    />
                  </View>
                  <View style={styles.inputRow}>
                    <Text style={styles.inputText}>New Pass:</Text>
                    <TextInput
                      style={[styles.input, {width: wp(70)}]}
                      value={this.state.newPassword}
                      placeholder="Enter Your New Password"
                      placeholderTextColor="grey"
                      onChangeText={input => {
                        this.setState({newPassword: input});
                      }}
                    />
                  </View>
                  <View style={styles.inputRow}>
                    <Text style={styles.inputText}>Confirm Pass:</Text>
                    <TextInput
                      style={[styles.input, {width: wp(60)}]}
                      value={this.state.confirmPassword}
                      placeholder="Enter Your Confirm Password"
                      placeholderTextColor="grey"
                      onChangeText={input => {
                        this.setState({confirmPassword: input});
                      }}
                    />
                  </View>
                </View>
              ) : null}
              <View
                style={{
                  flexDirection: this.state.changePassword ? 'row' : 'column',
                  justifyContent: this.state.changePassword
                    ? 'center'
                    : 'flex-start',
                }}>
                <TouchableOpacity
                  style={[
                    this.state.changePassword
                      ? styles.changeButton
                      : styles.bottomButton,
                    {backgroundColor: Color.warn, marginBottom: 0},
                  ]}
                  onPress={async () => {
                    if (!this.state.detailsLoader) {
                      this.setState({
                        changePassword: !this.state.changePassword,
                      });
                    } else {
                      Global.toasterMessage(
                        'Please wait, Your details are saving currently.',
                      );
                    }
                  }}>
                  <Text style={styles.buttonText}>
                    {this.state.changePassword ? 'Cancel' : 'Change Password'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={
                    this.state.changePassword
                      ? styles.changeButton
                      : styles.bottomButton
                  }
                  onPress={async () => {
                    if (!this.state.detailsLoader) {
                      this.saveDetails();
                    }
                  }}>
                  {this.state.detailsLoader ? (
                    <ActivityIndicator
                      style={{alignSelf: 'center'}}
                      size="large"
                      color="white"
                    />
                  ) : (
                    <Text style={styles.buttonText}>
                      {this.state.changePassword
                        ? 'Change Password'
                        : 'Save Details'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputText}>Cart:</Text>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                  {this.state.cartItems > 0
                    ? this.state.cartItems + ' item in your cart.'
                    : 'You have no items in your cart.'}
                </Text>
                {this.state.cartItems > 0 ? (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      this.props.navigation.navigate('Cart');
                    }}>
                    <Ionicons
                      style={{alignSelf: 'center'}}
                      color="white"
                      name="cart"
                      size={30}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
              <View style={[styles.inputRow, {marginTop: 5}]}>
                <Text style={styles.inputText}>Wishlist:</Text>
                <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 2}}>
                  {this.state.wishItems > 0
                    ? this.state.wishItems + ' item in your wishlist.'
                    : 'You have no items in your wishlist.'}
                </Text>
                {this.state.wishItems > 0 ? (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      this.props.navigation.navigate('Wishlist');
                    }}>
                    <Ionicons
                      style={{alignSelf: 'center'}}
                      color="red"
                      name="heart"
                      size={30}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
              <View style={[styles.inputRow, {marginTop: 5}]}>
                <Text style={styles.inputText}>Order Placed:</Text>
                <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 2}}>
                  {this.state.orderPlaced > 0
                    ? this.state.orderPlaced + ' order has been placed.'
                    : 'You have no order placed yet.'}
                </Text>
                {this.state.orderPlaced > 0 ? (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      this.props.navigation.navigate('Orders');
                    }}>
                    <FontAwesome
                      style={{alignSelf: 'center'}}
                      color="white"
                      name="truck"
                      size={25}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
              <View style={[styles.inputRow, {marginTop: 5}]}>
                <Text style={styles.inputText}>Saved Address:</Text>
                <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 2}}>
                  {this.state.wishItems > 0
                    ? this.state.savedAddress + ' address is saved.'
                    : 'You have no address saved.'}
                </Text>
                {this.state.savedAddress > 0 ? (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      this.props.navigation.navigate('Address');
                    }}>
                    <FontAwesome
                      style={{alignSelf: 'center'}}
                      color="white"
                      name="address-card"
                      size={25}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
              {this.state.lastUsedAddress && this.state.lastUsedAddress.name ? (
                <View style={{marginTop: 5, flexDirection: 'column'}}>
                  <CardView
                    style={{margin: 5}}
                    cardElevation={5}
                    cardMaxElevation={2}
                    cornerRadius={10}>
                    <Text
                      style={[
                        styles.inputText,
                        {marginLeft: 5, marginRight: 5, marginTop: 5},
                      ]}>
                      Last Used Address:
                    </Text>
                    <View style={{flexDirection: 'column', margin: 5}}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: 'bold',
                          marginLeft: 2,
                        }}>
                        Name:{' '}
                        <Text style={{fontSize: 16, fontWeight: 'normal'}}>
                          {this.state.lastUsedAddress.name}
                        </Text>
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: 'bold',
                          marginLeft: 2,
                        }}>
                        Ph:{' '}
                        <Text style={{fontSize: 16, fontWeight: 'normal'}}>
                          {this.state.lastUsedAddress.ph}
                        </Text>
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: 'bold',
                          marginLeft: 2,
                        }}>
                        Address:{' '}
                        <Text style={{fontSize: 16, fontWeight: 'normal'}}>
                          {'City-' +
                            this.state.lastUsedAddress.city +
                            ', Dist-' +
                            this.state.lastUsedAddress.dist +
                            ' ,State-' +
                            this.state.lastUsedAddress.state +
                            ' ,Pin-' +
                            this.state.lastUsedAddress.pin}
                        </Text>
                      </Text>
                    </View>
                  </CardView>
                </View>
              ) : null}
              {this.state.lastPlacedOrder &&
              this.state.lastPlacedOrder.orderId ? (
                <View style={{marginTop: 5, flexDirection: 'column'}}>
                  <CardView
                    style={{margin: 5}}
                    cardElevation={5}
                    cardMaxElevation={2}
                    cornerRadius={10}>
                    <Text
                      style={[
                        styles.inputText,
                        {marginLeft: 5, marginRight: 5, marginTop: 5},
                      ]}>
                      Last Order Details:
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <View
                        style={{
                          width: 100,
                          height: 100,
                          borderWidth: 1,
                          alignSelf: 'center',
                          marginLeft: 5,
                          marginBottom: 5,
                          alignItems: 'center',
                        }}>
                        <Image
                          style={{width: 95, height: 95}}
                          source={{
                            uri: this.state.lastPlacedOrder.orderDetail[0].img,
                          }}
                        />
                      </View>
                      <View
                        style={{
                          flexDirection: 'column',
                          marginRight: 5,
                          marginBottom: 5,
                        }}>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            marginLeft: 2,
                          }}>
                          {this.state.lastPlacedOrder.orderDetail[0].name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            marginLeft: 2,
                          }}>
                          Price:{' '}
                          <Text style={{fontSize: 16, fontWeight: 'normal'}}>
                            {this.state.lastPlacedOrder.orderDetail[0].price}
                          </Text>
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            marginLeft: 2,
                          }}>
                          Qty:{' '}
                          <Text style={{fontSize: 16, fontWeight: 'normal'}}>
                            {this.state.lastPlacedOrder.orderDetail[0].orderqty}
                          </Text>
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            marginLeft: 2,
                          }}>
                          Order on:{' '}
                          <Text style={{fontSize: 16, fontWeight: 'normal'}}>
                            {
                              this.state.lastPlacedOrder.orderDetail[0]
                                .orderTime
                            }
                          </Text>
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            marginLeft: 2,
                          }}>
                          Expected on:{' '}
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: 'normal',
                              color: 'green',
                            }}>
                            {
                              this.state.lastPlacedOrder.orderDetail[0]
                                .deliveryTime
                            }
                          </Text>
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        this.props.navigation.navigate('Orders');
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderBottomWidth: 0.5,
                          borderTopWidth: 0.5,
                        }}>
                        <Text
                          style={{
                            fontSize: 18,
                            color: 'gray',
                            marginBottom: 5,
                          }}>
                          {' '}
                          {'<'} View Details {'>'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </CardView>
                </View>
              ) : null}
              <TouchableOpacity
                style={styles.bottomButton}
                onPress={async () => {
                  subscriber.next({name: '', order: 0, wishList: 0});
                  await AsyncStorage.clear();
                  this.props.navigation.dispatch(StackActions.replace('Home'));
                }}>
                <Text style={styles.buttonText}>Signout</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255,.8)',
  },
  imgContainer: {
    backgroundColor: Color.primary,
    height: hp(20),
    alignItems: 'center',
    borderBottomWidth: 0.75,
  },
  iconContainer: {
    position: 'relative',
    left: 40,
    bottom: 30,
    backgroundColor: 'black',
    borderRadius: 100,
  },
  imageView: {width: 150, height: 150, borderRadius: 100},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    width: wp(80),
    height: 40,
    color: 'black',
    backgroundColor: 'white',
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 5,
    margin: hp(1),
  },
  inputText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: Color.primary,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
  },
  bottomButton: {
    height: 40,
    margin: 10,
    marginRight: 20,
    borderRadius: 5,
    backgroundColor: Color.primary,
  },
  changeButton: {
    width: wp(40),
    height: 40,
    margin: 10,
    marginRight: 20,
    borderRadius: 5,
    backgroundColor: Color.primary,
  },
});

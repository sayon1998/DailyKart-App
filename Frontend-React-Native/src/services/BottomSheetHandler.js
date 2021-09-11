/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Button,
  PermissionsAndroid,
  Text,
  TextInput,
  Keyboard,
  Platform,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import RBSheet from 'react-native-raw-bottom-sheet';
import Color from './color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import Global, {address} from './global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CardView from 'react-native-cardview';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
} from 'react-native-simple-radio-button';
import Spinner from 'react-native-loading-spinner-overlay';

export default class BottomSheetHandler extends Component {
  constructor(props) {
    super();
    this.state = {
      phone: '',
      isLoading: false,
      isSubmitLoading: false,
      isGpsLoading: false,
      colorChange: false,
      spinner: false,
      pin: '',
      address: [],
      sheetType: '',
    };
  }
  async componentDidMount() {
    this.toggleBottomSheet();
    if (await Global.isLoggedIn()) {
      this.getAddressDetails();
    }
  }
  async getAddressDetails() {
    this.setState({isLoading: true});
    await axios
      .get(
        Global.apiURL +
          `address/get-all-address/${await AsyncStorage.getItem('_id')}`,
      )
      .then(res => {
        if (
          res.data &&
          res.data.status &&
          res.data.data &&
          res.data.data.length > 0
        ) {
          this.setState({isLoading: false, address: res.data.data});
        } else {
          this.setState({isLoading: false});
        }
      })
      .catch(err => {
        console.log(err.message);
        this.setState({isLoading: false});
      });
  }
  toggleBottomSheet = () => {
    if (this.props.toggle) {
      console.log('Type', this.props.type);
      this.setState({sheetType: this.props.type});
      this.RBSheet.open();
    } else {
      this.RBSheet.close();
    }
  };
  async componentWillUnmount() {
    this.RBSheet.close();
    this.props.handler();
    this.setState({
      phone: '',
      isLoading: false,
      isSubmitLoading: false,
      isGpsLoading: false,
      colorChange: false,
      spinner: false,
      pin: '',
      address: [],
    });
  }
  async requestLocationPermission() {
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        )
          .then(grant => {
            console.log('GRANT', grant);
            if (grant === PermissionsAndroid.RESULTS.GRANTED) {
              this.setState({isGpsLoading: true});
              Geolocation.getCurrentPosition(
                async position => {
                  console.log(JSON.stringify(position));
                  if (
                    position &&
                    position.coords.latitude &&
                    position.coords.longitude
                  ) {
                    await axios
                      .get(
                        Global.apiURL +
                          `address/get-current-location/${position.coords.latitude}/${position.coords.longitude}`,
                      )
                      .then(async res => {
                        if (res.data && res.data.status && res.data.data) {
                          this.setState({
                            colorChange: true,
                            pin: res.data.data.pin,
                            isGpsLoading: false,
                          });
                          await this.onClickSubmit();
                        }
                      })
                      .catch(err => {
                        // console.warn(err.message);
                        Global.toasterMessage(err.message);
                        this.setState({isGpsLoading: true});
                      });
                  }
                },
                err => {
                  console.warn('ERROR_LOCATION_PROVIDER', err.message);
                  this.setState({isGpsLoading: true});
                },
                {enableHighAccuracy: false, timeout: 5000, maximumAge: 10000},
              );
            }
          })
          .catch(err => {
            console.error(err.message);
            this.setState({isGpsLoading: true});
          });
      }
    } catch (error) {
      console.warn('CATCH_ERROR', error.message);
      this.setState({isGpsLoading: true});
    }
  }
  async onCLickRadio(index) {
    if (!this.state.address[index].isRecentlyUsed) {
      let tempAdd = [];
      this.state.address.forEach((e, ind) => {
        if (ind === index) {
          e.isRecentlyUsed = true;
          tempAdd.push(e);
        } else {
          e.isRecentlyUsed = false;
          tempAdd.push(e);
        }
      });
      this.setState({address: tempAdd});
      await this.addressChange(this.state.address[index]);
    } else {
      Global.toasterMessage('Already selected');
    }
  }
  async addressChange(addressData) {
    let params = {
      userId: await AsyncStorage.getItem('_id'),
      addressId: addressData.addressId,
    };
    this.setState({spinner: true});
    await axios
      .post(Global.apiURL + 'address/address-recently-used', params)
      .then(res => {
        if (res.data && res.data.status) {
          this.setState({spinner: false});
          address.next(addressData);
          this.RBSheet.close();
          this.props.handler();
        } else {
          this.setState({spinner: false});
        }
      })
      .catch(err => {
        console.log(err.message);
        this.setState({spinner: false});
      });
  }
  async onClickSubmit() {
    this.setState({isSubmitLoading: true});
    await axios
      .get(Global.apiURL + `address/get-state-city-place/${this.state.pin}`)
      .then(async res => {
        if (res.data && res.data.status && res.data.data) {
          address.next({
            name: (await Global.isLoggedIn())
              ? await AsyncStorage.getItem('name')
              : 'Guest user',
            ph: res.data.data.ph,
            area: res.data.data.ps,
            dist: res.data.data.dist,
            pin: res.data.data.pin,
            state: res.data.data.state,
            city: res.data.data.city,
          });
          this.setState({isSubmitLoading: false});
          this.RBSheet.close();
          this.props.handler();
        } else {
          this.setState({isSubmitLoading: false});
        }
      })
      .catch(err => {
        this.setState({isSubmitLoading: false});
        console.warn(err.message);
        Global.toasterMessage(err.response.data.message);
      });
  }
  _renderAddress() {
    return (
      <FlatList
        style={{marginBottom: 10}}
        data={this.state.address}
        keyExtractor={item => item.addressId}
        scrollEnabled={true}
        renderItem={({item, index}) => (
          <CardView
            style={styles.addressContainer}
            key={index}
            cardElevation={5}
            cardMaxElevation={2}
            cornerRadius={5}>
            <View
              style={{
                flexDirection: 'row',
                borderWidth: 1,
                justifyContent: 'space-between',
              }}>
              <View style={{flexDirection: 'column', margin: hp(1)}}>
                <View style={styles.row}>
                  <Text style={{fontSize: 18, fontWeight: 'bold'}}>Name: </Text>
                  <Text style={{fontSize: 16}}>{item.name}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={{fontSize: 18, fontWeight: 'bold'}}>Ph: </Text>
                  <Text style={{fontSize: 16}}>{item.ph}</Text>
                </View>
                <View
                  style={[
                    styles.row,
                    {alignItems: 'flex-start', maxWidth: wp(75)},
                  ]}>
                  <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                    Address:{' '}
                  </Text>
                  <Text style={{fontSize: 16}}>
                    {item.area +
                      ', City- ' +
                      item.city +
                      ', Dist- ' +
                      item.dist +
                      ', State- ' +
                      item.state +
                      ', Pin- ' +
                      item.pin}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      maxWidth: wp(75),
                    }}>
                    Landmark:{' '}
                  </Text>
                  <Text style={{fontSize: 16}}>
                    {item.landmark ? item.landmark : 'No landmark available.'}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                    Address Type:{' '}
                  </Text>
                  <Text style={{fontSize: 16}}>{item.addressType}</Text>
                </View>
              </View>
              <View style={{alignSelf: 'flex-start'}}>
                <RadioForm formHorizontal={false} animation={true}>
                  <RadioButton labelHorizontal={true} key={index}>
                    <RadioButtonInput
                      obj={item}
                      index={index}
                      isSelected={item.isRecentlyUsed}
                      borderWidth={1}
                      buttonInnerColor={'#2196f3'}
                      buttonOuterColor={
                        item.isRecentlyUsed ? '#2196f3' : '#000'
                      }
                      onPress={() => {
                        this.onCLickRadio(index);
                      }}
                      buttonSize={20}
                      buttonOuterSize={25}
                      buttonWrapStyle={{
                        margin: 5,
                      }}
                    />
                  </RadioButton>
                </RadioForm>
              </View>
            </View>
          </CardView>
        )}
      />
    );
  }
  render() {
    return (
      <RBSheet
        ref={ref => {
          this.RBSheet = ref;
        }}
        animationType="fade"
        height={hp(50)}
        openDuration={250}
        closeDuration={250}
        closeOnPressBack={true}
        closeOnPressMask={
          this.state.isGpsLoading || this.state.isSubmitLoading ? false : true
        }
        onClose={() => {
          this.props.handler();
        }}
        customStyles={
          {
            // container: {
            //   justifyContent: 'center',
            //   alignItems: 'center',
            // },
          }
        }>
        <View style={styles.header}>
          <Spinner visible={this.state.spinner} textContent={'Loading...'} />
          <Text
            style={{
              fontSize: 25,
              fontWeight: 'bold',
              alignSelf: 'flex-start',
              marginLeft: hp(0.5),
            }}>
            {this.state.sheetType === 'order' ? 'Order Now' : 'Address'}
          </Text>
          {this.state.sheetType === 'order' ? (
            <View>
              <Text>Order Details</Text>
            </View>
          ) : (
            <View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={this.state.pin}
                  placeholder="Enter pin code here"
                  placeholderTextColor="grey"
                  keyboardType="number-pad"
                  onChangeText={input => {
                    if (input && input.length === 6) {
                      Keyboard.dismiss(0);
                    }
                    if (input && input.length <= 6) {
                      this.setState({pin: input});
                    }
                  }}
                />
                <Button
                  disabled={
                    this.state.isGpsLoading || this.state.isSubmitLoading
                  }
                  title="Submit"
                  color={Color.primary}
                  onPress={() => {
                    if (this.state.pin && this.state.pin.length === 6) {
                      this.onClickSubmit();
                    } else {
                      Global.toasterMessage('Please provide correct pin code');
                    }
                  }}
                />
              </View>
              <View style={styles.locationRow}>
                <Text style={{fontSize: 18, marginLeft: 5}}>
                  Use your current location
                </Text>
                {this.state.isGpsLoading ? (
                  <ActivityIndicator
                    style={{marginRight: 5}}
                    size="small"
                    color={Color.primary}
                  />
                ) : (
                  <Icon
                    style={{marginRight: 5}}
                    onPress={async () => {
                      if (!this.state.isSubmitLoading) {
                        await this.requestLocationPermission();
                      }
                    }}
                    name="gps-fixed"
                    size={25}
                    color={this.state.colorChange ? Color.primary : 'black'}
                  />
                )}
              </View>
              <Text style={{fontSize: 20, fontWeight: 'bold', margin: hp(1)}}>
                Your Addresses
              </Text>
              <View style={{borderBottomWidth: 1}} />
              {this.state.isLoading ? (
                <ActivityIndicator
                  style={{alignSelf: 'center', marginVertical: hp(10)}}
                  size="large"
                  color={Color.primary}
                />
              ) : this.state.address && this.state.address.length > 0 ? (
                this._renderAddress()
              ) : (
                <View
                  style={{flexDirection: 'column', justifyContent: 'center'}}>
                  <Image
                    style={{width: 150, height: 150, alignSelf: 'center'}}
                    source={require('../assets/images/no-save-address.png')}
                  />
                  <Text
                    style={{
                      fontSize: 18,
                      color: 'gray',
                      alignSelf: 'center',
                      marginBottom: 5,
                    }}>
                    You have no save addresses
                  </Text>
                  <View style={{alignSelf: 'center'}}>
                    <Button title="Add Address" color={Color.primary} />
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </RBSheet>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    width: wp(100),
    height: hp(50),
    margin: hp(0.5),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  input: {
    width: wp(75),
    height: 40,
    color: 'black',
    backgroundColor: 'white',
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 5,
    margin: hp(1),
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: wp(95),
    height: 40,
    backgroundColor: '#D3D3D3',
    marginLeft: 5,
  },
  addressContainer: {
    width: wp(95),
    alignSelf: 'center',
    marginBottom: hp(0.5),
    marginTop: hp(0.5),
    backgroundColor: 'white',
  },
});

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
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Global from '../../services/global';
import CardView from 'react-native-cardview';
import Color from '../../services/color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Picker} from '@react-native-community/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PopupMenu from '../../services/PopupMenu';
import Geolocation from '@react-native-community/geolocation';
import Spinner from 'react-native-loading-spinner-overlay';

export default class Address extends Component {
  constructor(props) {
    super();
    this.state = {
      addressName: '',
      ph: '',
      area: '',
      pin: '',
      state: '',
      dist: '',
      city: '',
      cityArray: [],
      tempArea: '',
      landmark: '',
      addressType: 'Home',
      radio_props: [
        {label: 'Home (Everyday)', value: 'Home'},
        {label: 'Office (Except Saturday and Sunday)', value: 'Office'},
      ],
      addressArray: [],
      isEditable: false,
      isLoading: false,
      noAddress: false,
      tempAddress: [],
      isGpsLoading: false,
      isSubmitLoading: false,
    };
    this.onClick.bind(this);
  }
  componentDidMount() {
    // Commend in production
    // this.getAddressDetails();
    // End Commend
    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      this.setState({
        addressName: '',
        ph: '',
        area: '',
        pin: '',
        state: '',
        dist: '',
        city: '',
        cityArray: [],
        tempArea: '',
        landmark: '',
        addressType: 'Home',
        radio_props: [
          {label: 'Home (Everyday)', value: 'Home'},
          {label: 'Office (Except Saturday and Sunday)', value: 'Office'},
        ],
        addressArray: [],
        isEditable: false,
        isLoading: false,
        noAddress: false,
        tempAddress: [],
        isGpsLoading: false,
        isSubmitLoading: false,
      });
      console.log('Address Listener');
      this.getAddressDetails();
    });
  }
  componentWillUnmount() {
    this.setState({
      addressName: '',
      ph: '',
      area: '',
      pin: '',
      state: '',
      dist: '',
      city: '',
      cityArray: [],
      tempArea: '',
      landmark: '',
      addressType: 'Home',
      radio_props: [
        {label: 'Home (Everyday)', value: 'Home'},
        {label: 'Office (Except Saturday and Sunday)', value: 'Office'},
      ],
      addressArray: [],
      isEditable: false,
      isLoading: false,
      noAddress: false,
      tempAddress: [],
      isGpsLoading: false,
      isSubmitLoading: false,
    });
    this.unsubscribe();
  }
  getAddressDetails = async () => {
    if (await Global.isLoggedIn()) {
      this.setState({isSubmitLoading: true});
      await axios
        .get(
          Global.apiURL +
            'address/get-all-address/' +
            (await AsyncStorage.getItem('_id')),
        )
        .then(res => {
          if (res.data && res.data.status) {
            if (res.data.data) {
              this.setState({
                isSubmitLoading: false,
                addressArray: res.data.data,
              });
            }
          } else {
            this.setState({isSubmitLoading: false, noAddress: true});
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
        });
    }
  };
  onPopupEvent = (eventName, index) => {
    if (eventName !== 'itemSelected') return;
    if (index === 0) this.onEdit(this.state.tempAddress);
    else this.onRemove(this.state.tempAddress.addressId);
  };

  onEdit(item) {
    console.log('Edit');
    this.setState({
      addressName: item.name,
      ph: String(item.ph),
      area: !item.area
        ? (item.area ? 'Area- ' + item.area + ',' : '') +
          'City- ' +
          item.city +
          ',' +
          'Dist- ' +
          item.dist +
          ',' +
          'State- ' +
          item.state +
          ',' +
          'Pin- ' +
          item.pin +
          '.'
        : item.area,
      pin: String(item.pin),
      state: item.state,
      dist: item.dist,
      city: item.city,
      landmark: item.landmark,
      addressType: item.addressType,
      isEditable: true,
    });
    this.getCityByPin(item.city, '', item.area);
  }
  async onRemove(addressId) {
    console.log('Remove');
    this.setState({isSubmitLoading: true});
    await axios
      .delete(
        Global.apiURL +
          'address/delete-user-address/' +
          (await AsyncStorage.getItem('_id')) +
          '/' +
          addressId,
      )
      .then(async res => {
        if (res.data && res.data.status) {
          Global.toasterMessage(res.data.message);
          await this.getAddressDetails();
        }
      })
      .catch(err => {
        this.setState({isSubmitLoading: false});
        console.log(
          err && err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message,
        );
      });
  }
  onClick = async tempAddress => {
    this.setState({tempAddress: tempAddress});
  };
  _renderAddress() {
    return (
      <FlatList
        data={this.state.addressArray}
        keyExtractor={item => item.addressId}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        renderItem={({item, index}) => (
          <CardView
            style={{
              backgroundColor: 'white',
              marginLeft: 10,
              marginTop: 10,
              marginRight: 10,
              marginBottom:
                index === this.state.addressArray.length - 1 ? hp(10) : 2,
            }}>
            <View style={{flexDirection: 'column', margin: 10}}>
              <View style={{flexDirection: 'row'}}>
                <View style={{width: hp(40)}}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                      Name:{' '}
                    </Text>
                    <Text style={{fontSize: 16}}>{item.name}</Text>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>Ph: </Text>
                    <Text style={{fontSize: 16}}>{item.ph}</Text>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                      Address:{' '}
                    </Text>
                    <Text style={{fontSize: 16, flex: 1, flexWrap: 'wrap'}}>
                      {!item.area
                        ? (item.area ? 'Area- ' + item.area + ',' : '') +
                          'City- ' +
                          item.city +
                          ',' +
                          'Dist- ' +
                          item.dist +
                          ',' +
                          'State- ' +
                          item.state +
                          ',' +
                          'Pin- ' +
                          item.pin +
                          '.'
                        : item.area}
                    </Text>
                  </View>
                  {item.landmark ? (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                        Landmark:{' '}
                      </Text>
                      <Text style={{fontSize: 16, flex: 1, flexWrap: 'wrap'}}>
                        {item.landmark}
                      </Text>
                    </View>
                  ) : null}
                  {item.addressType ? (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                        Address Type:{' '}
                      </Text>
                      <Text style={{fontSize: 16}}>{item.addressType}</Text>
                    </View>
                  ) : (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                        Address Type:{' '}
                      </Text>
                      <Text style={{fontSize: 16}}>Home</Text>
                    </View>
                  )}
                </View>
                <View>
                  <PopupMenu
                    actions={['Edit', 'Remove']}
                    item={this.state.addressArray[index]}
                    onPress={this.onPopupEvent}
                    onClick={this.onClick}
                  />
                </View>
              </View>
            </View>
          </CardView>
        )}
      />
    );
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
                            pin: res.data.data.pin,
                            isGpsLoading: false,
                          });
                          await this.getCityByPin();
                        }
                      })
                      .catch(err => {
                        // console.warn(err.message);
                        Global.toasterMessage(err.message);
                        this.setState({isGpsLoading: false});
                      });
                  }
                },
                err => {
                  console.warn('ERROR_LOCATION_PROVIDER', err.message);
                  this.setState({isGpsLoading: false});
                },
                {enableHighAccuracy: false, timeout: 5000, maximumAge: 10000},
              );
            }
          })
          .catch(err => {
            console.error(err.message);
            this.setState({isGpsLoading: false});
          });
      }
    } catch (error) {
      console.warn('CATCH_ERROR', error.message);
      this.setState({isGpsLoading: false});
    }
  }
  async getCityByPin(city = '', pin = '', area = '') {
    this.setState({isSubmitLoading: true});
    await axios
      .get(
        Global.apiURL +
          `address/get-state-city-place/${
            this.state.pin && this.state.pin.length === 6 ? this.state.pin : pin
          }`,
      )
      .then(async res => {
        console.log(res.data);
        if (res.data && res.data.status && res.data.data) {
          this.setState({
            tempArea: res.data.data.ps ? res.data.data.ps : '',
            area: area
              ? area
              : (res.data.data.ps ? 'Area- ' + res.data.data.ps + ',' : '') +
                'City- ' +
                (city ? city : res.data.data.city[0]) +
                ',' +
                'Dist- ' +
                res.data.data.dist +
                ',' +
                'State- ' +
                res.data.data.state +
                ',' +
                'Pin- ' +
                res.data.data.pin +
                '.',
            dist: res.data.data.dist,
            pin: res.data.data.pin,
            state: res.data.data.state,
            city: city ? city : res.data.data.city[0],
            cityArray: res.data.data.city,
            isSubmitLoading: false,
          });
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
  async onSubmitAddress() {
    if (!this.state.area) {
      Global.toasterMessage('Area is Required');
      return false;
    }
    if (!this.state.ph) {
      Global.toasterMessage('Phone number is Required');
      return false;
    }
    if (!this.state.addressName) {
      Global.toasterMessage('Name is Required');
      return false;
    }
    if (!this.state.city) {
      Global.toasterMessage('City is Required');
      return false;
    }
    let params = {
      userId: await AsyncStorage.getItem('_id'),
      address: [
        {
          addressId: 0,
          name: this.state.addressName,
          isRecentlyUsed: false,
          ph: this.state.ph,
          pin: this.state.pin,
          city: this.state.city,
          state: this.state.state,
          dist: this.state.dist,
          area: this.state.area,
          landmark: this.state.landmark,
          addressType: this.state.addressType,
        },
      ],
    };
    this.setState({isSubmitLoading: true});
    await axios
      .post(Global.apiURL + 'address/save-address', params)
      .then(res => {
        console.log(JSON.stringify(res.data));
        if (res.data && res.data.status) {
          if (
            res.data.data &&
            res.data.data.address &&
            res.data.data.address.length > 0
          ) {
            this.setState({
              isSubmitLoading: false,
              isEditable: false,
              addressName: '',
              ph: '',
              area: '',
              pin: '',
              state: '',
              dist: '',
              tempArea: '',
              city: '',
              cityArray: [],
              landmark: '',
              addressType: 'Home',
            });
            this.getAddressDetails();
            Global.toasterMessage(res.data.message);
          } else {
            this.setState({
              isSubmitLoading: false,
            });
          }
        }
      })
      .catch(err => {
        console.log(
          err && err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message,
        );
        this.setState({
          isSubmitLoading: false,
        });
        Global.toasterMessage(
          err && err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message,
        );
      });
  }
  render() {
    return (
      <View style={styles.mainContainer}>
        <Spinner
          visible={this.state.isSubmitLoading}
          textContent={'Loading...'}
        />
        {this.state.isEditable ? (
          <CardView
            style={{margin: 5, marginTop: 20, backgroundColor: 'white'}}
            cardElevation={5}
            cardMaxElevation={2}
            cornerRadius={10}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 5,
                marginTop: 5,
              }}>
              <Text style={{fontSize: 25, fontWeight: 'bold'}}>
                Add New Address
              </Text>
            </View>
            <View style={[styles.inputRow, {margin: 5, marginTop: 15}]}>
              <Text style={styles.inputText}>Name:</Text>
              <TextInput
                style={[styles.input, {width: wp(70)}]}
                value={this.state.addressName}
                placeholder="Enter Name"
                placeholderTextColor="grey"
                editable={!this.state.isGpsLoading}
                onChangeText={input => {
                  this.setState({addressName: input});
                }}
              />
            </View>
            <View style={[styles.inputRow, {margin: 5}]}>
              <Text style={styles.inputText}>ph:</Text>
              <TextInput
                style={[styles.input, {width: wp(70)}]}
                value={this.state.ph}
                placeholder="Enter Phone Number"
                keyboardType="number-pad"
                editable={!this.state.isGpsLoading}
                maxLength={10}
                placeholderTextColor="grey"
                onChangeText={input => {
                  this.setState({ph: input});
                }}
              />
            </View>
            <View style={[styles.inputRow, {margin: 5}]}>
              <Text style={styles.inputText}>Pin:</Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={[styles.input, {width: wp(62)}]}
                  value={this.state.pin}
                  editable={!this.state.isGpsLoading}
                  placeholder="Enter Pin Code"
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholderTextColor="grey"
                  onChangeText={async input => {
                    this.setState({pin: input});
                    if (input && input.length === 6) {
                      this.getCityByPin('', input);
                    }
                  }}
                />
                {this.state.isGpsLoading ? (
                  <ActivityIndicator
                    style={{alignSelf: 'center', marginRight: 10}}
                    size="small"
                    color={Color.primary}
                  />
                ) : (
                  <Icon
                    style={{marginRight: 5}}
                    onPress={async () => {
                      this.requestLocationPermission();
                    }}
                    name="gps-fixed"
                    size={25}
                    color={Color.primary}
                  />
                )}
              </View>
            </View>
            <View style={[styles.inputRow, {margin: 5}]}>
              <Text style={styles.inputText}>Area:</Text>
              <TextInput
                style={[styles.input, {width: wp(70), height: 65}]}
                value={this.state.area}
                multiline={true}
                numberOfLines={5}
                editable={!this.state.isGpsLoading}
                placeholder="Enter Area/Locality address"
                placeholderTextColor="grey"
                onChangeText={input => {
                  this.setState({area: input});
                }}
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={[styles.inputText, {marginLeft: 5}]}>City:</Text>
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: 5,
                  margin: hp(1),
                  width: wp(70),
                  marginRight: 15,
                }}>
                <Picker
                  enabled={!this.state.isGpsLoading}
                  selectedValue={this.state.city}
                  style={{height: 40, width: wp(70)}}
                  onValueChange={(itemValue, itemIndex) => {
                    console.log(itemValue);
                    this.setState({
                      city: itemValue,
                      area: this.state.area.includes('City-')
                        ? (this.state.tempArea
                            ? 'Area- ' + this.state.tempArea + ','
                            : '') +
                          'City- ' +
                          this.state.city +
                          ',' +
                          'Dist- ' +
                          this.state.dist +
                          ',' +
                          'State- ' +
                          this.state.state +
                          ',' +
                          'Pin- ' +
                          this.state.pin +
                          '.'
                        : this.state.area,
                    });
                  }}>
                  {this.state.cityArray.map((myValue, myIndex) => {
                    return (
                      <Picker.Item
                        key={myIndex}
                        label={myValue}
                        value={myValue}
                      />
                    );
                  })}
                </Picker>
              </View>
            </View>
            <View style={[styles.inputRow, {margin: 5}]}>
              <Text style={styles.inputText}>Dist:</Text>
              <TextInput
                style={[styles.input, {width: wp(70)}]}
                value={this.state.dist}
                editable={false}
                placeholder="Enter Dist"
                placeholderTextColor="grey"
              />
            </View>
            <View style={[styles.inputRow, {margin: 5}]}>
              <Text style={styles.inputText}>State:</Text>
              <TextInput
                style={[styles.input, {width: wp(70)}]}
                value={this.state.state}
                editable={false}
                placeholder="Enter State"
                placeholderTextColor="grey"
              />
            </View>
            <View style={[styles.inputRow, {margin: 5}]}>
              <Text style={styles.inputText}>Landmark:</Text>
              <TextInput
                style={[styles.input, {width: wp(70)}]}
                value={this.state.landmark}
                placeholder="Enter Landmark"
                editable={!this.state.isGpsLoading}
                placeholderTextColor="grey"
                onChangeText={input => {
                  this.setState({landmark: input});
                }}
              />
            </View>
            <View
              style={{
                margin: 5,
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
              <Text style={{fontWeight: 'bold', fontSize: 20}}>
                Add delivery instructions:
              </Text>
              <Text style={{color: 'gray', fontSize: 16}}>
                Preferences are used to plan your delivery. However, shipments
                can sometimes arrive early or later than planned.
              </Text>
            </View>
            <View style={styles.inputRow}>
              <Text style={[styles.inputText, {marginLeft: 5}]}>
                Address Type:
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: 5,
                  margin: hp(1),
                  width: wp(60),
                  marginRight: 15,
                }}>
                <Picker
                  enabled={!this.state.isGpsLoading}
                  selectedValue={this.state.addressType}
                  style={{height: 40, width: wp(60)}}
                  onValueChange={(itemValue, itemIndex) => {
                    this.setState({addressType: itemValue});
                  }}>
                  {this.state.radio_props.map((myValue, myIndex) => {
                    return (
                      <Picker.Item
                        key={myIndex}
                        label={myValue.label}
                        value={myValue.value}
                      />
                    );
                  })}
                </Picker>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}>
              <TouchableOpacity
                style={[styles.button, {width: wp(40)}]}
                onPress={() => {
                  this.setState({isEditable: false});
                }}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, {width: wp(40)}]}
                onPress={() => {
                  if (!this.state.isGpsLoading) {
                    this.onSubmitAddress();
                  } else {
                    Global.toasterMessage(
                      'Please wait, we are fetching your location.',
                    );
                  }
                }}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </CardView>
        ) : (
          <View>
            <CardView
              style={{margin: 5, backgroundColor: 'white'}}
              cardElevation={5}
              cardMaxElevation={2}
              cornerRadius={10}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: 5,
                }}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                  Add new address
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    this.setState({
                      addressName: '',
                      ph: '',
                      area: '',
                      pin: '',
                      state: '',
                      dist: '',
                      city: '',
                      cityArray: [],
                      landmark: '',
                      addressType: 'Home',
                      radio_props: [
                        {label: 'Home (Everyday)', value: 'Home'},
                        {
                          label: 'Office (Except Saturday and Sunday)',
                          value: 'Office',
                        },
                      ],
                      isEditable: true,
                    });
                  }}>
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </CardView>
            {this.state.noAddress ? (
              <View
                style={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  style={{width: 250, height: 250}}
                  source={require('../../assets/images/no-save-address.png')}
                />
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                  No Address is Saved.
                </Text>
                <Text style={{fontSize: 16, color: 'gray'}}>
                  Save your address now and keep shopping.
                </Text>
              </View>
            ) : (
              this._renderAddress()
            )}
          </View>
        )}
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
    backgroundColor: 'rgba(255, 255, 255,.8)',
  },
  button: {
    width: 100,
    height: 40,
    margin: 10,
    marginRight: 20,
    borderRadius: 5,
    backgroundColor: Color.primary,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
  },
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
    marginLeft: 10,
    marginRight: 10,
  },
  inputText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

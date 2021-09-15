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
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {StackActions} from '@react-navigation/native';
import Global from '../../services/global';
import CardView from 'react-native-cardview';
import Color from '../../services/color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Picker} from '@react-native-community/picker';
import RadioForm from 'react-native-simple-radio-button';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PopupMenu from '../../services/PopupMenu';

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
      tempAddress: {},
    };
    this.onClick.bind(this);
  }
  componentDidMount() {
    // Commend in production
    this.getAddressDetails();
    // End Commend
    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      console.log('Address Listener');
      this.getAddressDetails();
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  getAddressDetails = async () => {
    // get-all-address
    if (await Global.isLoggedIn()) {
      this.setState({isLoading: true});
      await axios
        .get(
          Global.apiURL +
            'address/get-all-address/' +
            (await AsyncStorage.getItem('_id')),
        )
        .then(res => {
          if (res.data && res.data.status) {
            if (res.data.data) {
              this.setState({isLoading: false, addressArray: res.data.data});
            }
          } else {
            this.setState({isLoading: false, noAddress: true});
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
    if (index === 0) this.onEdit();
    else this.onRemove();
  };
  onEdit() {
    console.log('Edit');
    this.setState({
      addressName: item.name,
      ph: item.ph,
      area:
        (item.area ? 'Area- ' + item.area + ',' : '') +
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
        '.',
      pin: item.pin,
      state: item.state,
      dist: item.dist,
      city: item.city,
      landmark: item.landmark,
      addressType: item.addressType,
      isEditable: true,
    });
  }
  onRemove() {
    console.log('Remove');
  }
  tempAddress;
  onClick(item) {
    console.log('Click', item);
    this.tempAddress = item;
  }
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
              marginBottom: 2,
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
                      {(item.area ? 'Area- ' + item.area + ',' : '') +
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
                        '.'}
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
                    item={item}
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
  render() {
    return (
      <View style={styles.mainContainer}>
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
                  numberOfLines={3}
                  placeholder="Enter Pin Code"
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholderTextColor="grey"
                  onChangeText={input => {
                    this.setState({pin: input});
                  }}
                />
                <Icon
                  style={{marginRight: 5}}
                  onPress={async () => {}}
                  name="gps-fixed"
                  size={25}
                  color={Color.primary}
                />
              </View>
            </View>
            <View style={[styles.inputRow, {margin: 5}]}>
              <Text style={styles.inputText}>Area:</Text>
              <TextInput
                style={[styles.input, {width: wp(70), height: 60}]}
                value={this.state.area}
                numberOfLines={3}
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
                  selectedValue={this.state.city}
                  style={{height: 40, width: wp(70)}}
                  onValueChange={(itemValue, itemIndex) => {
                    console.log(itemValue);
                    this.setState({city: itemValue});
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
                  selectedValue={this.state.addressType}
                  style={{height: 40, width: wp(60)}}
                  onValueChange={(itemValue, itemIndex) => {
                    console.log(itemValue);
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
                onPress={() => {}}>
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
                    this.setState({isEditable: true});
                  }}>
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </CardView>
            {this._renderAddress()}
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

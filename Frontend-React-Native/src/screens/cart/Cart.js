/* eslint-disable prettier/prettier */
/* eslint-disable radix */
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
  Dimensions,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Button,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Global, {address} from '../../services/global';
import axios from 'axios';
import CardView from 'react-native-cardview';
import CheckBox from '@react-native-community/checkbox';
import Color from '../../services/color';
import Icon from 'react-native-vector-icons/Ionicons';
import {Picker} from '@react-native-community/picker';
import BottomSheetHandler from '../../services/BottomSheetHandler';

const {width, height} = Dimensions.get('window');

export default class Cart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      cartLists: [],
      isLoading: true,
      refresh: false,
      noProduct: false,
      selectAll: false,
      qty: 1,
      bottomViewer: true,
      totalPrice: 0,
      totalDeliveryCharge: 0,
      dialog: false,
      dialogText: '',
      dialogItems: [],
      dialogLoading: false,
      dialogType: '',
      locationContainerOpen: false,
      addressName: '',
      ph: '',
      address: '',
      pin: '',
      isCheckoutLoading: false,
    };
    this.handler = this.handler.bind(this);
  }

  componentDidMount() {
    // ######### Comment for Production #########
    this.getCartDetails();
    this.getAddress();
    //  ########## End Comment ##########
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      console.log('Cart Listener');
      this.handler = this.handler.bind(this);
      this.getCartDetails();
      this.getAddress();
      this.setState({
        name: '',
        cartLists: [],
        isLoading: true,
        refresh: false,
        noProduct: false,
        selectAll: false,
        qty: 1,
        bottomViewer: true,
        totalPrice: 0,
        totalDeliveryCharge: 0,
        dialog: false,
        dialogText: '',
        dialogItems: [],
        dialogLoading: false,
        dialogType: '',
        locationContainerOpen: false,
        addressName: '',
        ph: '',
        address: '',
        pin: '',
        isCheckoutLoading: false,
      });
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  handler() {
    this.setState({
      locationContainerOpen: false,
    });
    address.subscribe(res => {
      if (res && res.pin) {
        this.setState({
          addressName: res.name,
          ph: res.ph,
          address:
            res.area +
            ', City- ' +
            res.city +
            ', Dist- ' +
            res.dist +
            ', State- ' +
            res.state +
            ', Pin- ' +
            res.pin,
          pin: res.pin,
        });
      }
    });
  }
  async getAddress() {
    if (await Global.isLoggedIn()) {
      await axios
        .get(
          Global.apiURL +
            `address/get-address/${await AsyncStorage.getItem('_id')}`,
        )
        .then(res => {
          if (res.data && res.data.status && res.data.data) {
            this.setState({
              addressName: res.data.data.name,
              ph: res.data.data.ph,
              address:
                res.data.data.area +
                ', City- ' +
                res.data.data.city +
                ', Dist- ' +
                res.data.data.dist +
                ', State- ' +
                res.data.data.state +
                ', Pin- ' +
                res.data.data.pin,
              pin: res.data.data.pin,
            });
          }
        })
        .catch(err => {
          console.warn(err.response.data.message);
        });
    }
  }
  async getCartDetails() {
    let cartList = [];
    this.setState({
      name: (await AsyncStorage.getItem('name'))
        ? await AsyncStorage.getItem('name')
        : '',
    });
    if (await Global.isLoggedIn()) {
      await axios
        .get(
          Global.apiURL +
            `product/get-cart-wishlist/${await AsyncStorage.getItem(
              '_id',
            )}/cartlist`,
        )
        .then(async response => {
          //   console.log(response.data);
          if (response.data && response.data.status) {
            if (
              response.data.data &&
              response.data.data.cart &&
              response.data.data.cart.length > 0
            ) {
              cartList = response.data.data.cart;
              await AsyncStorage.removeItem('cartList');
              await AsyncStorage.setItem('cartList', JSON.stringify(cartList));
            } else {
              this.setState({
                isLoading: false,
                refresh: false,
                noProduct: true,
              });
            }
          }
        })
        .catch(err => {
          console.log('Error:', err.response.data.message);
        });
    } else {
      cartList = JSON.parse(await AsyncStorage.getItem('cartList'))
        ? JSON.parse(await AsyncStorage.getItem('cartList'))
        : [];
    }
    if (cartList && cartList.length > 0) {
      let params = {
        product: cartList,
      };
      await axios
        .post(Global.apiURL + 'product/productbymultipleid', params)
        .then(response => {
          //   console.log(response.data);
          if (response.data && response.data.status) {
            if (response.data.data && response.data.data.length > 0) {
              let totalPrice = 0,
                deliveryCharge = 0;
              response.data.data.forEach(e => {
                e.isChecked = true;
                e.qty = parseInt(e.minqty);
                totalPrice += parseInt(e.price) * parseInt(e.minqty);
                if (e.deliverycharge) {
                  deliveryCharge += parseInt(e.deliverycharge);
                }
                if (e.minqty && e.highestquentity) {
                  e.qtyArray = [];
                  for (let i = e.minqty; i <= e.highestquentity; i++) {
                    e.qtyArray.push({label: String(i), value: i});
                  }
                }
              });
              this.setState({cartLists: []});
              this.setState({
                isLoading: false,
                refresh: false,
                selectAll: true,
                cartLists: response.data.data,
                totalPrice: totalPrice,
                totalDeliveryCharge: deliveryCharge,
              });
            } else {
              this.setState({
                isLoading: false,
                refresh: false,
                noProduct: true,
              });
            }
          } else {
            this.setState({
              isLoading: false,
              refresh: false,
              noProduct: true,
            });
          }
        })
        .catch(err => {
          console.log(err.message);
        });
    } else {
      this.setState({isLoading: false, refresh: false, noProduct: true});
    }
  }
  async onClickCheckbox(value, id) {
    if (id) {
      let tempCart = [],
        flag = false;
      this.state.cartLists.forEach(e => {
        if (e._id === id) {
          e.isChecked = value;
        }
        tempCart.push(e);
        if (value !== e.isChecked && e._id !== id) {
          flag = true;
        }
      });
      if (flag) {
        this.setState({cartLists: tempCart, selectAll: false});
      } else {
        this.setState({cartLists: tempCart, selectAll: true});
      }
    } else {
      let tempCart = [];
      this.state.cartLists.forEach(e => {
        e.isChecked = value;
        tempCart.push(e);
      });
      this.setState({cartLists: tempCart, selectAll: value});
    }
    this.priceDetailsUpdate(this.state.cartLists);
  }
  priceDetailsUpdate(item) {
    if (item && item.length > 0) {
      let totalPrice = 0,
        deliveryCharge = 0;
      item.forEach(e => {
        if (e.isChecked) {
          totalPrice += parseInt(e.price) * parseInt(e.qty);
          if (e.deliverycharge) {
            deliveryCharge += parseInt(e.deliverycharge);
          }
        }
      });
      this.setState({
        totalDeliveryCharge: deliveryCharge,
        totalPrice: totalPrice,
      });
    } else {
      this.setState({totalDeliveryCharge: 0, totalPrice: 0});
    }
  }
  quantityUpdate(qtyValue, id) {
    let tempCart = [];
    this.state.cartLists.forEach(e => {
      if (e._id === id) {
        e.qty = qtyValue;
      }
      tempCart.push(e);
    });
    this.setState({cartLists: tempCart});
    this.priceDetailsUpdate(this.state.cartLists);
  }
  refreshHandler = () => {
    this.setState({refresh: true}, () => {
      this.getCartDetails();
    });
  };
  toggleDialog = (type = '', text = '', items) => {
    this.setState({
      dialog: !this.state.dialog,
      dialogText: text,
      dialogItems: items,
      dialogType: type,
    });
  };
  renderDialog() {
    return (
      <Modal transparent={true} visible={this.state.dialog}>
        <View
          style={{
            backgroundColor: '#000000aa',
            flex: 1,
            justifyContent: 'center',
          }}>
          <View
            style={{
              backgroundColor: '#ffffff',
              margin: 20,
              padding: 10,
              borderRadius: 10,
              maxHeight: height / 2,
              // flex: 1,
            }}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 5}}>
                {this.state.dialogText}
              </Text>
              <TouchableOpacity
                disabled={this.state.dialogLoading}
                onPress={this.toggleDialog}>
                <Icon name="close-circle-outline" size={30} />
              </TouchableOpacity>
            </View>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-around'}}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderWidth: 2,
                  borderRadius: 10,
                }}>
                <Image
                  style={{
                    width: 95,
                    height: 95,
                    borderWidth: 2,
                    borderRadius: 10,
                  }}
                  source={{uri: this.state.dialogItems.img}}
                />
              </View>
              <View>
                <Text>
                  <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                    Product:{' '}
                  </Text>{' '}
                  <Text
                    style={{
                      fontSize: 15,
                    }}>
                    {this.state.dialogItems.name &&
                    this.state.dialogItems.name.length > 20
                      ? this.state.dialogItems.name.slice(0, 20) + '...'
                      : this.state.dialogItems.name}
                  </Text>
                </Text>
                {this.state.dialogItems.rating ? (
                  <Text>
                    <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                      Rating:{' '}
                    </Text>
                    <Icon name="star" color="green" size={15} />
                    <Text
                      style={{
                        color: 'green',
                        fontWeight: 'bold',
                        fontSize: 15,
                      }}>
                      {this.state.dialogItems.rating}
                    </Text>
                  </Text>
                ) : null}

                <Text>
                  <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                    Price:{' '}
                  </Text>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 15,
                    }}>
                    {'₹'}
                    {this.state.dialogItems.price}
                  </Text>{' '}
                  <Text
                    style={{
                      color: 'gray',
                      fontSize: 14,
                      textDecorationLine: 'line-through',
                    }}>
                    {'₹'}
                    {this.state.dialogItems.originalprice}
                  </Text>{' '}
                  {this.state.dialogItems.offerpercentage !== '0' ? (
                    <Text
                      style={{
                        color: 'green',
                        fontWeight: 'bold',
                        fontSize: 13,
                      }}>
                      {this.state.dialogItems.offerpercentage + '%'}
                    </Text>
                  ) : null}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: hp(1),
              }}>
              {!this.state.dialogLoading ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    marginTop: hp(1),
                  }}>
                  <Button
                    title="Cancel"
                    color={Color.warn}
                    onPress={() => this.toggleDialog()}
                  />
                  <View style={{marginLeft: hp(1)}}></View>
                  <Button
                    title="Confirm"
                    color={Color.primary}
                    onPress={async () => {
                      this.setState({dialogLoading: true});
                      await this.performAction(
                        this.state.dialogItems._id,
                        this.state.dialogItems.name,
                      );
                    }}
                  />
                </View>
              ) : (
                <ActivityIndicator size="large" color={Color.primary} />
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  }
  performAction = async () => {
    await Global.onClickCartWishList(
      'cartDelete',
      this.state.dialogItems._id,
      this.state.dialogItems.name,
    ).then(res => {
      if (res) {
        let tempCart = [];
        this.state.cartLists.forEach(e => {
          if (e._id !== this.state.dialogItems._id) {
            tempCart.push(e);
          }
        });
        if (tempCart && tempCart.length > 0) {
          this.setState({
            dialog: false,
            dialogText: '',
            dialogItems: [],
            dialogLoading: false,
            dialogType: '',
            cartLists: tempCart,
          });
        } else {
          this.setState({
            dialog: false,
            cartLists: [],
            noProduct: true,
            dialogText: '',
            dialogItems: [],
            dialogLoading: false,
            dialogType: '',
          });
        }
        this.priceDetailsUpdate(this.state.cartLists);
      } else {
        this.setState({
          dialog: false,
          dialogText: '',
          dialogItems: [],
          dialogLoading: false,
          dialogType: '',
        });
      }
    });
  };
  _renderCart = () => {
    return (
      <FlatList
        data={this.state.cartLists}
        keyExtractor={item => item._id}
        scrollEnabled={true}
        refreshing={this.state.refresh}
        onRefresh={this.refreshHandler}
        onScroll={event => {
          if (event.nativeEvent.contentOffset.y === 0) {
            this.setState({bottomViewer: true});
          } else {
            this.setState({bottomViewer: false});
          }
        }}
        renderItem={({item, index}) => (
          <CardView
            key={index}
            style={[
              styles.cartContainer,
              {marginTop: index === 0 ? hp(2) : hp(0)},
            ]}
            cardElevation={5}
            cardMaxElevation={2}
            cornerRadius={10}>
            <View style={{borderWidth: 1}}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 5,
                }}>
                <CheckBox
                  tintColors={{
                    true: Color.primary,
                  }}
                  disabled={this.state.isCheckoutLoading}
                  value={item.isChecked}
                  onValueChange={value => {
                    this.onClickCheckbox(value, item._id);
                  }}
                />
                <TouchableOpacity
                  onPress={async () => {
                    this.toggleDialog(
                      'delete',
                      `Are ${
                        this.state.name ? this.state.name.split(' ')[0] : 'you'
                      } want to delete?`,
                      item,
                    );
                  }}>
                  <Icon name="close" size={30} />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginLeft: 5,
                  marginRight: 10,
                  marginBottom: 10,
                }}>
                <View style={{flexDirection: 'column'}}>
                  <Text style={{fontSize: 20}}>
                    {item.name && item.name.length > 25
                      ? item.name.slice(0, 25) + '...'
                      : item.name}
                  </Text>
                  <Text style={{fontSize: 16, color: 'gray'}}>
                    {item.company && item.company.length > 25
                      ? item.company.slice(0, 25) + '...'
                      : item.company}
                  </Text>
                  {item.totalrating ? (
                    <View style={{flexDirection: 'row'}}>
                      <Icon color="green" name="star" size={15} />
                      <Text
                        style={{
                          fontSize: 16,
                          marginLeft: 2,
                          fontWeight: 'bold',
                          color: 'green',
                        }}>
                        {item.rating}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          marginLeft: 2,
                          fontWeight: 'bold',
                          color: 'green',
                        }}>
                        ({item.totalrating})
                      </Text>
                    </View>
                  ) : null}
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                      {'₹'}
                      {item.price}{' '}
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        color: 'gray',
                        textDecorationLine: 'line-through',
                      }}>
                      {'₹'}
                      {item.originalprice}
                    </Text>
                    {item.offerpercentage !== '0' ? (
                      <Text
                        style={{
                          fontSize: 16,
                          color: 'green',
                          fontWeight: 'bold',
                        }}>
                        {' '}
                        {item.offerpercentage + '%'}
                      </Text>
                    ) : null}
                  </View>
                  {item.deliverycharge ? (
                    <Text style={{fontSize: 16}}>
                      <Text style={{color: 'red', fontWeight: 'bold'}}>
                        {'₹'}
                        {item.deliverycharge}
                      </Text>
                      {' shipping charge required'}
                    </Text>
                  ) : (
                    <Text style={{fontSize: 16, color: 'green'}}>
                      Free shipping{' '}
                      <Text style={{fontWeight: 'bold', color: 'black'}}>
                        (Conditionally)
                      </Text>
                    </Text>
                  )}
                  {item.quantity <= 10 ? (
                    <Text
                      style={{
                        fontSize: 16,
                        color: Color.warn,
                        fontWeight: 'bold',
                      }}>
                      Only {item.quantity} item left.
                    </Text>
                  ) : null}
                </View>
                <View
                  style={{
                    width: 105,
                    height: 105,
                    borderWidth: 1,
                    justifyContent: 'center',
                  }}>
                  <Image
                    style={{width: 100, height: 100, alignSelf: 'center'}}
                    source={{uri: item.img}}
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginLeft: 5,
                  marginRight: 10,
                  marginBottom: 20,
                }}>
                {item.errMsg ? (
                  <Text
                    style={{fontSize: 16, fontWeight: 'bold', color: 'red'}}>
                    {item.errMsg}
                  </Text>
                ) : (
                  <View />
                )}
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <Text style={{alignSelf: 'center', fontWeight: 'bold'}}>
                    Qty:
                  </Text>
                  <View style={{borderWidth: 0.5, width: 70, marginLeft: 1}}>
                    <Picker
                      selectedValue={item.qty}
                      style={{height: 20, width: 85}}
                      onValueChange={(itemValue, itemIndex) => {
                        this.quantityUpdate(itemValue, item._id);
                      }}>
                      {item.qtyArray.map((myValue, myIndex) => {
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
              </View>
            </View>
          </CardView>
        )}
      />
    );
  };
  toggleLocation = () => {
    this.setState({
      locationContainerOpen: !this.state.locationContainerOpen,
    });
  };
  locationRender = () => {
    return (
      <BottomSheetHandler
        toggle={this.state.locationContainerOpen}
        handler={this.handler}
      />
    );
  };
  async onClickCheckout() {
    let params = {
        pin: this.state.pin,
        productId: [],
      },
      flag = false;
    this.state.cartLists.forEach(e => {
      if (e.isChecked) {
        params.productId.push(e._id);
      }
    });
    this.setState({isCheckoutLoading: true});
    await axios
      .post(Global.apiURL + 'address/check-multiple-order-deliveriable', params)
      .then(async res => {
        if (res.data && res.data.status) {
          if (res.data.data && res.data.data.length > 0) {
            let Checkout = [],
              tempCheckout = [],
              totalOriginalPrice = 0;
            this.state.cartLists.forEach(e => {
              if (
                e.isChecked &&
                res.data.data.findIndex(x => x.productId === e._id) > -1
              ) {
                (e.errMsg =
                  res.data.data[
                    res.data.data.findIndex(x => x.productId === e._id)
                  ].message === 'Deliveriable'
                    ? ''
                    : res.data.data[
                        res.data.data.findIndex(x => x.productId === e._id)
                      ].message),
                  tempCheckout.push(e),
                  (totalOriginalPrice += parseFloat(e.originalprice) * e.qty);
                if (
                  res.data.data[
                    res.data.data.findIndex(x => x.productId === e._id)
                  ].message !== 'Deliveriable'
                ) {
                  flag = true;
                }
              } else {
                e.errMsg = '';
              }
              Checkout.push(e);
            });
            this.setState({cartLists: Checkout, isCheckoutLoading: false});
            if (!flag) {
              if (await Global.isLoggedIn()) {
                console.log('Move to Checkout');
                this.props.navigation.navigate('Checkout', {
                  checkout: tempCheckout,
                  address: this.state.address,
                  name: this.state.addressName,
                  ph: this.state.ph,
                  deliveryCharge: this.state.totalDeliveryCharge,
                  totalPrice: this.state.totalPrice,
                  totalOriginalPrice: totalOriginalPrice,
                });
              } else {
                this.props.navigation.navigate('Auth');
              }
            }
          } else {
            this.setState({isCheckoutLoading: false});
          }
        }
      })
      .catch(err => {
        console.log(err.response.data.message);
        this.setState({isCheckoutLoading: false});
      });
  }
  render() {
    return (
      <View style={styles.mainContainer}>
        <View style={{height: height}}>
          {/* Location */}
          {!!this.state.locationContainerOpen && this.locationRender()}
          {!!this.state.dialog && this.renderDialog()}
          <CardView
            key={0}
            style={styles.cardContainer}
            cardElevation={5}
            cardMaxElevation={2}
            cornerRadius={10}>
            <View style={styles.bottomMainRow}>
              {this.state.address ? (
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    maxWidth: 250,
                  }}>
                  <Text style={{alignSelf: 'flex-start', marginLeft: 5}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                      Deliver to
                    </Text>{' '}
                    {this.state.addressName}
                  </Text>
                  {/* <Text style={{alignSelf: 'flex-start', marginLeft: 5}}>
                      Phone Number: {'+91-' + this.state.ph}
                    </Text> */}
                  <Text
                    style={{
                      alignSelf: 'flex-start',
                      marginLeft: 5,
                      fontSize: 12,
                    }}>
                    {this.state.address}
                  </Text>
                </View>
              ) : (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    alignSelf: 'center',
                    marginLeft: 10,
                  }}>
                  No address available
                </Text>
              )}

              <TouchableOpacity
                style={[styles.button, {width: 100, height: 40, marginTop: 20}]}
                onPress={() => {
                  this.toggleLocation();
                }}>
                <Text
                  style={[
                    styles.buttonText,
                    {fontWeight: 'normal', fontSize: 18, lineHeight: 40},
                  ]}>
                  Change
                </Text>
              </TouchableOpacity>
            </View>
          </CardView>
          {/* Cart Items */}
          {this.state.isLoading ? (
            <View
              style={{
                height: height / 2,
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
              <ActivityIndicator size="large" color={Color.primary} />
            </View>
          ) : this.state.noProduct ? (
            <View style={styles.somethingWentWrong}>
              <Image
                style={{width: 200, height: 200}}
                source={require('../../assets/images/cart.png')}
              />
              <Text style={{fontSize: 25, fontWeight: 'bold'}}>
                Oops,{' '}
                {this.state.name ? this.state.name.split(' ')[0] + "'s" : 'you'}{' '}
                have no cart !!!
              </Text>
              <Text style={{fontSize: 20, color: 'gray'}}>
                add your product to cart
              </Text>
            </View>
          ) : (
            this._renderCart()
          )}
        </View>
        {this.state.bottomViewer && this.state.totalPrice > 0 ? (
          <View style={styles.bottomContainer}>
            <View style={styles.bottomMainRow}>
              <View style={{flexDirection: 'column'}}>
                <View style={{flexDirection: 'row'}}>
                  <CheckBox
                    disabled={this.state.isCheckoutLoading}
                    tintColors={{
                      true: Color.primary,
                      false: 'black',
                    }}
                    value={this.state.selectAll}
                    onValueChange={value => {
                      this.onClickCheckbox(value, '');
                    }}
                  />
                  <Text style={{fontSize: 20, lineHeight: 40}}>Select All</Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent:
                      this.state.totalDeliveryCharge > 0
                        ? 'center'
                        : 'flex-start',
                    marginLeft: 5,
                  }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                    }}>
                    {'₹'}
                    {this.state.totalPrice}{' '}
                  </Text>
                  {this.state.totalDeliveryCharge > 0 ? (
                    <Text
                      style={{
                        fontSize: 15,
                        color: 'red',
                        alignSelf: 'center',
                      }}>
                      {'+ ₹'}
                      {this.state.totalDeliveryCharge + ' '}shipping charge
                    </Text>
                  ) : null}
                </View>
              </View>
              {this.state.isCheckoutLoading ? (
                <ActivityIndicator
                  style={{marginRight: wp(5), marginTop: hp(1)}}
                  size="large"
                  color={Color.primary}
                />
              ) : (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    this.onClickCheckout();
                  }}>
                  <Text style={styles.buttonText}>Checkout</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255,.8)',
  },
  cardContainer: {
    width: wp(95),
    height: 80,
    alignSelf: 'center',
    backgroundColor: 'white',
    marginTop: hp(8),
  },
  cartContainer: {
    width: wp(95),
    alignSelf: 'center',
    marginBottom: hp(2),
    backgroundColor: 'white',
  },
  button: {
    width: 150,
    height: 50,
    margin: 10,
    borderRadius: 5,
    backgroundColor: Color.primary,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    lineHeight: 50,
  },
  bottomContainer: {
    width: width,
    height: 80,
    justifyContent: 'space-between',
    position: 'absolute',
    backgroundColor: 'white',
    elevation: 20,
    borderTopWidth: 1,
  },
  bottomMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  somethingWentWrong: {
    width: width,
    height: height / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

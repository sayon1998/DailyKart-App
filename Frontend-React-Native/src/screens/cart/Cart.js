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
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Global from '../../services/global';
import axios from 'axios';
import CardView from 'react-native-cardview';
import CheckBox from '@react-native-community/checkbox';
import Color from '../../services/color';
import Icon from 'react-native-vector-icons/Ionicons';
import {Picker} from '@react-native-community/picker';

const {width, height} = Dimensions.get('window');

export default class Cart extends Component {
  constructor() {
    super();
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
    };
  }
  componentDidMount() {
    // ######### Comment for Production #########
    this.getCartDetails();
    //  ########## End Comment ##########
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      console.log('Cart Listener');
      this.getCartDetails();
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
      });
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
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
                totalPrice += parseInt(e.price);
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
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 5,
              }}>
              <View style={{borderWidth: 1, borderTopLeftRadius: 10}}>
                <CheckBox
                  tintColors={{
                    true: Color.primary,
                  }}
                  value={item.isChecked}
                  onValueChange={value => {
                    this.onClickCheckbox(value, item._id);
                  }}
                />
              </View>

              <View style={{borderWidth: 1, borderTopRightRadius: 10}}>
                <TouchableOpacity>
                  <Icon name="close" size={30} />
                </TouchableOpacity>
              </View>
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
              <View>
                {/* <Text style={{fontSize: 16, fontWeight: 'bold', color: 'red'}}>
                  ** Item is not available in 741245 **
                </Text> */}
              </View>
              <View
                style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
                <Text style={{alignSelf: 'center', fontWeight: 'bold'}}>
                  Qty:
                </Text>
                <View style={{borderBottomWidth: 1, width: 90}}>
                  <Picker
                    selectedValue={item.qty}
                    style={{height: 20, width: 100}}
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
          </CardView>
        )}
      />
    );
  };
  render() {
    return (
      <View style={styles.mainContainer}>
        <View style={{height: height}}>
          {/* Location */}
          <CardView
            key={0}
            style={styles.cardContainer}
            cardElevation={5}
            cardMaxElevation={2}
            cornerRadius={10}>
            <View style={styles.bottomMainRow}>
              <View style={{flexDirection: 'column', justifyContent: 'center'}}>
                <Text style={{alignSelf: 'flex-start', marginLeft: 5}}>
                  <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                    Deliver to
                  </Text>{' '}
                  {'Sayon Chakraborty'}
                </Text>
                <Text style={{alignSelf: 'flex-start', marginLeft: 5}}>
                  Phone Number: {'+91-' + '9748623490'}
                </Text>
                <Text
                  style={{
                    alignSelf: 'flex-start',
                    marginLeft: 5,
                    fontSize: 16,
                  }}>
                  Address: {'Madanpur, Kalyannagr....'}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  {width: 100, height: 40, marginTop: 20},
                ]}>
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

              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Checkout</Text>
              </TouchableOpacity>
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

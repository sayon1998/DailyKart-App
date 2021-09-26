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
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Global from '../../services/global';
import CardView from 'react-native-cardview';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import {StackActions} from '@react-navigation/routers';
import RadioForm from 'react-native-simple-radio-button';
import Color from '../../services/color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const {width, height} = Dimensions.get('window');

export default class Checkout extends Component {
  radio_props = [
    {label: 'COD', value: 0},
    {label: 'Online', value: 1},
  ];
  constructor(props) {
    super();
    this.state = {
      ph: '',
      name: '',
      addressDetails: {},
      address: '',
      deliverycharge: 0,
      totalPrice: 0,
      totalOriginalPrice: 0,
      checkout: [],
      paymentMethod: 0,
      isLoading: false,
    };
  }
  componentDidMount() {
    // Comment on Production
    this.getCheckoutDetails();
    // Comment End
    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      console.log('Checkout');
      this.getCheckoutDetails();
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  getCheckoutDetails() {
    this.setState({
      addressDetails: this.props.route.params.addressDetails,
      ph: this.props.route.params.ph,
      name: this.props.route.params.name,
      address: this.props.route.params.address,
      checkout: this.props.route.params.checkout,
      deliverycharge: this.props.route.params.deliverycharge,
      totalPrice:
        parseFloat(this.props.route.params.totalPrice) +
        parseFloat(
          this.props.route.params.deliverycharge
            ? this.props.route.params.deliverycharge
            : 0,
        ),
      totalOriginalPrice: this.props.route.params.totalOriginalPrice,
    });
  }
  _renderCheckout() {
    return (
      <FlatList
        data={this.state.checkout}
        style={styles.checkFlatList}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item._id}
        ref={node => {
          this.scroll = node;
        }}
        renderItem={({item, index}) => (
          <CardView
            key={index}
            style={styles.checkoutContainer}
            cardElevation={5}
            cardMaxElevation={2}
            cornerRadius={10}>
            <View
              style={{
                flexDirection: 'row',
                // height: hp(25),
              }}>
              <View
                style={{flexDirection: 'column', justifyContent: 'flex-start'}}>
                <View
                  style={{flexDirection: 'row', marginLeft: 5, marginTop: 5}}>
                  <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                    Order No:{' '}
                  </Text>
                  <Text
                    style={{fontSize: 16, alignSelf: 'center', color: 'gray'}}>
                    {index + 1}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: 5,
                    marginBottom: 5,
                  }}>
                  <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                    Product:{' '}
                  </Text>
                  <Text style={{fontSize: 16, alignSelf: 'center'}}>
                    {item.name}
                  </Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <View
                    style={{
                      width: 105,
                      height: 105,
                      borderWidth: 1,
                      alignItems: 'center',
                      marginLeft: 5,
                    }}>
                    <Image
                      style={{width: 100, height: 100}}
                      source={{uri: item.img}}
                    />
                  </View>
                  <View style={{flexDirection: 'column'}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 5,
                      }}>
                      <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                        Rate:{' '}
                      </Text>
                      {item.totalrating ? (
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Icon color="green" name="star" size={12} />
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
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 5,
                      }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: 'bold',
                          alignSelf: 'center',
                        }}>
                        Price:{' '}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          alignSelf: 'center',
                        }}>
                        {'₹'}
                        {item.price}{' '}
                      </Text>
                      <Text
                        style={{
                          fontSize: 15,
                          color: 'gray',
                          alignSelf: 'center',
                          textDecorationLine: 'line-through',
                        }}>
                        {'₹'}
                        {item.originalprice}
                      </Text>
                      {item.offerpercentage !== '0' ? (
                        <Text
                          style={{
                            fontSize: 14,
                            color: 'green',
                            fontWeight: 'bold',
                            alignSelf: 'center',
                          }}>
                          {' '}
                          {item.offerpercentage + '%'}
                        </Text>
                      ) : null}
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 5,
                      }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: 'bold',
                          alignSelf: 'flex-start',
                        }}>
                        Qty:{' '}
                      </Text>
                      <Text style={{fontSize: 16, alignSelf: 'flex-start'}}>
                        {'x' + item.qty}
                      </Text>
                      {index + 1 === this.state.checkout.length ? null : (
                        <View
                          style={{
                            width: wp(50),
                            alignItems: 'flex-end',
                          }}>
                          <Icon
                            onPress={() => {
                              this.scroll.scrollToIndex({
                                animated: true,
                                index: index + 1,
                              });
                            }}
                            name="arrow-circle-o-right"
                            size={25}
                          />
                        </View>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 5,
                        maxWidth: wp(80),
                      }}>
                      <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                        Company:{' '}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          alignSelf: 'center',
                          color: 'gray',
                        }}>
                        {item.company}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 5,
                        maxWidth: wp(65),
                      }}>
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
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: 5,
                    maxWidth: wp(65),
                  }}>
                  <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                    Description:{' '}
                  </Text>
                  <Text style={{fontSize: 15, alignSelf: 'center'}}>
                    {item.description && item.description.length >= 80
                      ? item.description.slice(0, 80) + '...'
                      : item.description}
                  </Text>
                </View>
              </View>
            </View>
          </CardView>
        )}
      />
    );
  }
  async onClickProceed() {
    console.log('Proceed to Order');
    if (await Global.isLoggedIn()) {
      if (this.state.paymentMethod === 0) {
        this.onPlaceOrder({
          userId: await AsyncStorage.getItem('_id'),
          deliveryaddress: this.state.addressDetails,
          deliveryCharge: this.state.deliverycharge
            ? this.state.deliverycharge
            : 0,
          totalOfferPrice: String(this.state.totalPrice),
          totalOfferPercentage:
            String(
              parseFloat(
                ((parseFloat(this.state.totalOriginalPrice) -
                  parseFloat(this.state.totalPrice)) /
                  parseFloat(this.state.totalOriginalPrice)) *
                  100,
              ).toFixed(2),
            ) + '%',
          totalOriginalPrice: String(this.state.totalOriginalPrice),
          productDetails: this.state.checkout,
          paymentMethod: 'COD',
        });
      } else {
        // Online Method
      }
    } else {
      Global.isLoggedIn('Please login at first');
      this.props.navigation.dispatch(StackActions.replace('Auth'));
    }
  }
  async onPlaceOrder(params) {
    console.log(JSON.stringify(params));
    this.setState({isLoading: true});
    await axios
      .post(Global.apiURL + 'order/save-order-v2', params)
      .then(res => {
        // console.log(JSON.stringify(res.data));

        if (res.data && res.data.status) {
          if (
            res.data.data &&
            res.data.data.orderDetails &&
            res.data.data.orderDetails.length > 0
          ) {
            this.setState({isLoading: false});
            this.props.navigation.navigate('OrderPlaced', {
              orderDetails:
                res.data.data.orderDetails[
                  res.data.data.orderDetails.length - 1
                ].orderDetail[0],
            });
          }
        } else {
          Global.toasterMessage(res.data.message);
          this.setState({isLoading: false});
        }
      })
      .catch(err => {
        console.log(
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message,
        );
        this.setState({isLoading: false});
        Global.toasterMessage(
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message,
        );
      });
  }
  render() {
    return (
      <View style={styles.mainContainer}>
        {/* Delivery Address */}
        <CardView
          key={0}
          style={styles.cardContainer}
          cardElevation={5}
          cardMaxElevation={2}
          cornerRadius={10}>
          <Text style={{fontSize: 20, fontWeight: 'bold', margin: 5}}>
            Delivery Address
          </Text>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              margin: 5,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>Name: </Text>
              <Text style={{fontSize: 16}}>{this.state.name}</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>Ph: </Text>
              <Text style={{fontSize: 16}}>{'+91-' + this.state.ph}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                maxWidth: wp(70),
              }}>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>Address: </Text>
              <Text style={{fontSize: 16}}>{this.state.address}</Text>
            </View>
          </View>
        </CardView>
        {/* Order Details */}
        <View
          style={{
            borderBottomWidth: 0.5,
            margin: 5,
            alignSelf: 'flex-start',
            width: wp(95),
          }}>
          <Text style={{fontSize: 25, fontWeight: 'bold', marginBottom: 5}}>
            Order Details
          </Text>
        </View>
        {this._renderCheckout()}
        {/* Total Price Cardview */}
        <ScrollView>
          <CardView
            style={styles.cardContainer}
            cardElevation={5}
            cardMaxElevation={2}
            cornerRadius={10}>
            <View
              style={{
                margin: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text style={{fontSize: 20}}>Payment Method</Text>
              <View
                style={{
                  flexDirection: 'column',
                }}>
                <RadioForm
                  radio_props={this.radio_props}
                  animation={true}
                  initial={this.state.paymentMethod}
                  onPress={value => {
                    this.setState({paymentMethod: value});
                  }}
                />
              </View>
            </View>
          </CardView>
          <CardView
            style={styles.cardContainer}
            cardElevation={5}
            cardMaxElevation={2}
            cornerRadius={10}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 10,
                marginLeft: 10,
                marginRight: 10,
              }}>
              <Text style={{fontSize: 20}}>Item: </Text>
              <Text style={{fontSize: 18}}>{this.state.checkout.length}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <Text style={{fontSize: 20}}>Actual Price: </Text>
              <Text style={{fontSize: 18, color: 'gray', fontWeight: 'bold'}}>
                {'₹'}
                {this.state.totalOriginalPrice}
              </Text>
            </View>
            {parseFloat(this.state.totalOriginalPrice) -
              parseFloat(this.state.totalPrice) >
            0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginLeft: 10,
                  marginRight: 10,
                }}>
                <Text style={{fontSize: 20}}>Deduction Price: </Text>
                <Text
                  style={{fontSize: 18, color: 'green', fontWeight: 'bold'}}>
                  {'- ₹'}
                  {parseFloat(this.state.totalOriginalPrice) -
                    parseFloat(this.state.totalPrice)}
                </Text>
              </View>
            ) : null}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <Text style={{fontSize: 20}}>Delivery Charge: </Text>
              <Text style={{fontSize: 18, color: 'red'}}>
                {'+ ₹'}
                {this.state.deliverycharge ? this.state.deliverycharge : 0}
              </Text>
            </View>
            <View style={{borderWidth: 0.5, marginTop: 5}} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <Text style={{fontSize: 20}}>Total Price:</Text>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                {'₹'}
                {this.state.totalPrice}
              </Text>
            </View>
            {parseFloat(
              ((parseFloat(this.state.totalOriginalPrice) -
                parseFloat(this.state.totalPrice)) /
                parseFloat(this.state.totalOriginalPrice)) *
                100,
            ).toFixed(2) > 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginLeft: 10,
                  marginRight: 10,
                  marginBottom: 5,
                }}>
                <Text style={{fontSize: 20}}>Saving Percentage:</Text>
                <Text
                  style={{fontSize: 18, fontWeight: 'bold', color: 'green'}}>
                  {parseFloat(
                    ((parseFloat(this.state.totalOriginalPrice) -
                      parseFloat(this.state.totalPrice)) /
                      parseFloat(this.state.totalOriginalPrice)) *
                      100,
                  ).toFixed(2) + '%'}
                </Text>
              </View>
            ) : (
              <Text
                style={{
                  color: 'red',
                  alignSelf: 'center',
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 10,
                }}>
                Oops, you have'nt saving anything yet.
              </Text>
            )}
          </CardView>
          <CardView
            style={styles.cardContainer}
            cardElevation={5}
            cardMaxElevation={2}
            cornerRadius={10}>
            <Text style={{marginLeft: 10, marginTop: 10, fontSize: 18}}>
              {"DailyKart's T&C"}
            </Text>
            <Text
              style={{
                marginLeft: 10,
                marginRight: 10,
                marginBottom: 10,
                color: 'gray',
              }}>
              When your order is placed, we'll send you an e-mail message
              acknowledging receipt of your order. Your contract to purchase an
              item will not be complete until we receive confirmation about your
              item avaibility and dispatch your item. Curently you have choose
              to pay using Pay on Delivery (POD), you can pay using
              cash/card/net banking when you receive your item. See DailyKart's{' '}
              <Text style={{color: 'blue', textDecorationLine: 'underline'}}>
                Return Policy
              </Text>
              . Go to the{' '}
              <Text
                onPress={() => {
                  this.props.navigation.dispatch(StackActions.replace('Home'));
                }}
                style={{color: 'blue', textDecorationLine: 'underline'}}>
                DailyKart's home
              </Text>{' '}
              without completing your order.
            </Text>
          </CardView>
        </ScrollView>
        {/* Bottom Portion */}
        <View style={styles.bottomContainer}>
          <View style={styles.bottomMainRow}>
            <View />
            {this.state.isLoading ? (
              <ActivityIndicator
                style={{margin: 15}}
                size="large"
                color={Color.primary}
              />
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  this.onClickProceed();
                }}>
                <Text style={styles.buttonText}>Proceed</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255,.8)',
  },
  cardContainer: {
    width: wp(95),
    alignSelf: 'center',
    backgroundColor: 'white',
    margin: hp(1),
  },
  checkFlatList: {
    flex: 1,
    flexGrow: 0,
    minHeight: hp(25),
    flexDirection: 'row',
  },
  checkoutContainer: {
    width: wp(95),
    // maxHeight: hp(25),
    backgroundColor: 'white',
    margin: hp(1),
  },
  bottomContainer: {
    width: width,
    height: 60,
    justifyContent: 'space-between',
    backgroundColor: 'white',
    elevation: 20,
    borderTopWidth: 1,
  },
  bottomMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});

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
  FlatList,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {StackActions} from '@react-navigation/native';
import Global from '../../services/global';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Color from '../../services/color';
import CardView from 'react-native-cardview';
import {format, formatDistance, formatRelative, subDays} from 'date-fns';
import StarRating from 'react-native-star-rating';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

export default class Orders extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      orderDetails: [],
      noOrder: false,
    };
  }
  componentDidMount() {
    // ######### Comment for Production #########
    this.getOrderDetails();
    //  ########## End Comment ##########
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      console.log('Order Listener');
      // this.setState({
      //   orderDetails: [],
      //   isLoading: false,
      // });
      if (
        this.props.route &&
        this.props.route.params &&
        this.props.route.params.refresh
      ) {
        this.getOrderDetails();
      }
    });
  }
  componentWillUnmount() {
    // this.unsubscribe();
  }
  async getOrderDetails() {
    this.setState({isLoading: true});
    await axios
      .get(
        Global.apiURL +
          'order/get-order-details/' +
          (await AsyncStorage.getItem('_id')),
      )
      .then(res => {
        if (res.data && res.data.status) {
          if (res.data.data && res.data.data.length > 0) {
            // console.log(JSON.stringify(res.data.data));
            this.setState({
              orderDetails: res.data.data,
              isLoading: false,
            });
          } else {
            this.setState({isLoading: false, noOrder: true});
          }
        } else {
          this.setState({isLoading: false});
        }
      })
      .catch(err => {
        this.setState({isLoading: false});
        console.log(
          err && err.response && err.response.data
            ? err.response.data.message
            : err.message,
        );
      });
  }
  async onStarRatingPress(rating, orderId) {
    let tempArray = [],
      prevRate = 0,
      params = {
        userId: await AsyncStorage.getItem('_id'),
        productId: '',
        rate: '',
      };
    this.state.orderDetails.forEach(e => {
      if (e.orderId === orderId) {
        prevRate = e.orderDetail[0].userRating;
        e.orderDetail[0].userRating = rating;
        params.productId = e.orderDetail[0]._id;
      }
      tempArray.push(e);
    });
    if (Number(prevRate) !== rating) {
      params.rate = String(rating);
      this.setState({orderDetails: tempArray});
      await axios
        .post(Global.apiURL + 'product/rate-product', params)
        .then(res => {
          if (res.data && res.data.status) {
            Global.toasterMessage(res.data.message);
          }
        })
        .catch(err => {
          console.log(
            err && err.response && err.response.data
              ? err.response.data.message
              : err.message,
          );
        });
    }
  }
  _renderOrder() {
    return (
      <FlatList
        data={this.state.orderDetails}
        keyExtractor={item => item.orderId}
        scrollEnabled={true}
        renderItem={({item, index}) => (
          <TouchableWithoutFeedback
            onPress={() => {
              this.props.navigation.navigate('OrderDetails', {
                orderDetails: item,
              });
            }}>
            <CardView
              key={index}
              style={styles.cardContainer}
              cardElevation={5}
              cardMaxElevation={2}>
              <View
                style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
                {item.orderDetail && item.orderDetail.length > 1 ? (
                  <View
                    style={{
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        height: 100,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 100,
                          borderWidth: 0.5,
                          alignItems: 'center',
                          marginLeft: 5,
                          marginRight: 5,
                          justifyContent: 'center',
                        }}>
                        <Image
                          style={{width: 55, height: 55, borderRadius: 100}}
                          source={{uri: item.orderDetail[0].img}}
                        />
                      </View>
                      <View
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 100,
                          borderWidth: 0.5,
                          alignItems: 'center',
                          marginLeft: 5,
                          marginRight: 5,
                          justifyContent: 'center',
                        }}>
                        <Image
                          style={{width: 55, height: 55, borderRadius: 100}}
                          source={{uri: item.orderDetail[1].img}}
                        />
                      </View>
                    </View>
                    {item.orderDetail.length > 2 ? (
                      <Text
                        style={{
                          color: Color.primary,
                          fontSize: 14,
                          position: 'relative',
                          bottom: 15,
                          fontWeight: 'bold',
                        }}>
                        +{item.orderDetail.length - 2} more
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <View
                    style={{
                      height: 100,
                      justifyContent: 'center',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        width: 60,
                        height: 60,
                        borderRadius: 100,
                        borderWidth: 0.5,
                        alignItems: 'center',
                        marginLeft: 5,
                        marginRight: 5,
                        justifyContent: 'center',
                      }}>
                      <Image
                        style={{width: 55, height: 55, borderRadius: 100}}
                        source={{uri: item.orderDetail[0].img}}
                      />
                    </View>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}>
                  {item.totalorderPrice === 0 ? (
                    <Text
                      style={{fontSize: 18, color: 'red', fontWeight: 'bold'}}>
                      Order Cancelled
                    </Text>
                  ) : new Date(item.deliveryTime) >= new Date() ? (
                    item.orderDetail && item.orderDetail.length > 1 ? (
                      <Text
                        style={{
                          color: 'green',
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}>
                        Arriving on{' '}
                        {formatRelative(
                          new Date(item.deliveryTime),
                          new Date(),
                          {
                            lastWeek: '[letzten] dddd [um] LT',
                            yesterday: '[gestern um] LT',
                            today: '[heute um] LT',
                            tomorrow: '[morgen um] LT',
                            nextWeek: 'dddd [um] LT',
                          },
                        )}
                      </Text>
                    ) : (
                      <Text
                        style={{
                          color: 'green',
                          fontSize: 18,
                          fontWeight: 'bold',
                        }}>
                        Arriving on{' '}
                        {formatRelative(
                          new Date(item.deliveryTime),
                          new Date(),
                          {
                            lastWeek: '[letzten] dddd [um] LT',
                            yesterday: '[gestern um] LT',
                            today: '[heute um] LT',
                            tomorrow: '[morgen um] LT',
                            nextWeek: 'dddd [um] LT',
                          },
                        )}
                      </Text>
                    )
                  ) : item.orderDetail && item.orderDetail.length > 1 ? (
                    <Text
                      style={{fontSize: 16, fontWeight: 'bold', color: 'gray'}}>
                      Delivered on{' '}
                      {formatRelative(new Date(item.deliveryTime), new Date(), {
                        lastWeek: '[letzten] dddd [um] LT',
                        yesterday: '[gestern um] LT',
                        today: '[heute um] LT',
                        tomorrow: '[morgen um] LT',
                        nextWeek: 'dddd [um] LT',
                      })}
                    </Text>
                  ) : (
                    <Text
                      style={{fontSize: 18, fontWeight: 'bold', color: 'gray'}}>
                      Delivered on{' '}
                      {formatRelative(new Date(item.deliveryTime), new Date(), {
                        lastWeek: '[letzten] dddd [um] LT',
                        yesterday: '[gestern um] LT',
                        today: '[heute um] LT',
                        tomorrow: '[morgen um] LT',
                        nextWeek: 'dddd [um] LT',
                      })}
                    </Text>
                  )}
                  {item.orderDetail && item.orderDetail.length > 1 ? (
                    <Text style={{fontSize: 16}}>
                      {item.orderDetail[0].name &&
                      item.orderDetail[0].name.length +
                        item.orderDetail[1].name.length >
                        25
                        ? item.orderDetail[0].name.slice(0, 15) +
                          ',' +
                          item.orderDetail[1].name.slice(0, 10) +
                          '...'
                        : item.orderDetail[0].name}
                    </Text>
                  ) : (
                    <Text style={{fontSize: 16}}>
                      {item.orderDetail[0].name &&
                      item.orderDetail[0].name.length > 25
                        ? item.orderDetail[0].name.slice(0, 25) + '...'
                        : item.orderDetail[0].name}
                    </Text>
                  )}

                  {item.orderDetail && item.orderDetail.length > 1 ? null : (
                    <StarRating
                      disabled={false}
                      maxStars={5}
                      fullStarColor={'green'}
                      animation={'tada'}
                      starSize={35}
                      rating={Number(item.orderDetail[0].userRating)}
                      selectedStar={rating =>
                        this.onStarRatingPress(rating, item.orderId)
                      }
                    />
                  )}
                </View>
                {/* {item.orderDetail.length > 1 ? (
                  <View
                    style={{
                      alignSelf: 'center',
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      width: wp(10),
                    }}>
                    <EvilIcons
                      style={{alignSelf: 'center'}}
                      name="chevron-right"
                      size={40}
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      alignSelf: 'center',
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      width: wp(15),
                    }}>
                    <EvilIcons
                      style={{alignSelf: 'center'}}
                      name="chevron-right"
                      size={40}
                    />
                  </View>
                )} */}
              </View>
            </CardView>
          </TouchableWithoutFeedback>
        )}
      />
    );
  }
  render() {
    return (
      <View style={[styles.mainContainer, {justifyContent: 'center'}]}>
        {this.state.isLoading ? (
          <ActivityIndicator size="large" color={Color.primary} />
        ) : this.state.noOrder ? (
          <View style={{flexDirection: 'column', justifyContent: 'center'}}>
            <Image source={require('../../assets/images/no-order-found.jpg')} />
            <Text
              style={{fontSize: 25, fontWeight: 'bold', textAlign: 'center'}}>
              Oops, you have no order yet.
            </Text>
            <Text style={{fontSize: 18, textAlign: 'center', color: 'gray'}}>
              You can see your order details here, after confirmation.
            </Text>
          </View>
        ) : (
          this._renderOrder()
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
  cardContainer: {
    backgroundColor: 'white',
    margin: hp(1),
  },
});

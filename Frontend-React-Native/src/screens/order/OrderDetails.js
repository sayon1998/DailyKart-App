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
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {StackActions} from '@react-navigation/native';
import Global from '../../services/global';
import CardView from 'react-native-cardview';
import {format, formatRelative} from 'date-fns';
import Icon from 'react-native-vector-icons/FontAwesome';
import IoniIcons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Accordion from 'react-native-collapsible/Accordion';
import * as Animatable from 'react-native-animatable';
import Slider from '@react-native-community/slider';
import Color from '../../services/color';
import {iif} from 'rxjs';
import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const SECTIONS = [
  {
    title: 'Delivery Status',
    content: 'Lorem',
  },
];

export default class OrderDetails extends Component {
  constructor() {
    super();
    this.state = {
      orderDetails: [],
      activeSections: [],
      isOrderPlaced: true,
      isOrderPacked: false,
      isOrderDispatched: false,
      isOrderOutForDelivery: false,
      isOrderDelivered: false,
      dialog: false,
      dialogText: '',
      dialogLoading: false,
      cancelAmt: 0,
    };
  }

  componentDidMount() {
    // ######### Comment for Production #########
    this.getOrderDetails();
    //  ########## End Comment ##########
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      console.log('Order Details Listener');
      this.setState({
        orderDetails: [],
        isLoading: false,
        isOrderPlaced: true,
        isOrderPacked: false,
        isOrderDispatched: false,
        isOrderOutForDelivery: false,
        isOrderDelivered: false,
        dialog: false,
        dialogText: '',
        dialogLoading: false,
        cancelAmt: 0,
      });
      this.getOrderDetails();
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }

  getOrderDetails() {
    // console.log(JSON.stringify(this.props.route.params.orderDetails));
    let tempCancelAmt = 0;
    this.props.route.params.orderDetails.orderDetail.forEach(e => {
      if (e.isOrderCancel) {
        tempCancelAmt += Number(e.price);
      }
      if (e.isReturnable && new Date(e.returnTime) > new Date()) {
        e.isReturn = true;
      } else {
        e.isReturn = false;
      }
    });
    this.setState({
      orderDetails: this.props.route.params.orderDetails,
      isOrderPlaced: this.props.route.params.orderDetails.isOrderPlaced,
      isOrderPacked: this.props.route.params.orderDetails.isOrderPacked,
      isOrderDispatched: this.props.route.params.orderDetails.isOrderDispatched,
      isOrderOutForDelivery:
        this.props.route.params.orderDetails.isOrderOutForDelivery,
      isOrderDelivered: this.props.route.params.orderDetails.isOrderDelivered,
      cancelAmt: tempCancelAmt,
    });
  }

  _renderOrder() {
    return (
      <FlatList
        data={this.state.orderDetails.orderDetail}
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
                  <TouchableOpacity
                    onPress={() => {
                      this.props.navigation.navigate('Product', {
                        productId: item._id,
                      });
                    }}>
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
                  </TouchableOpacity>

                  <View style={{flexDirection: 'column'}}>
                    {item.rating ? (
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
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
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
                    ) : null}

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
                        {'x' + item.orderqty}
                      </Text>
                      {index + 1 ===
                      this.state.orderDetails.orderDetail.length ? null : (
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
                        Sold by:{' '}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          alignSelf: 'center',
                          color: 'gray',
                        }}>
                        {item.company ? item.company : 'Dailykart'}
                      </Text>
                    </View>

                    {item.isOrderCancel ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          marginLeft: 5,
                          maxWidth: wp(80),
                        }}>
                        <Text
                          style={{
                            fontSize: 14,
                            alignSelf: 'center',
                          }}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: 'bold',
                              marginBottom: 5,
                            }}>
                            {' '}
                            Cancelled on{' '}
                            <Text style={{color: 'red'}}>
                              {formatRelative(
                                new Date(item.cancelDate),
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
                          </Text>
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          </CardView>
        )}
      />
    );
  }

  _renderSectionTitle = section => {
    return <Animatable.View />;
  };
  _renderHeader(section, index, isActive, sections) {
    return (
      <Animatable.View
        duration={300}
        transition="backgroundColor"
        style={{
          backgroundColor: isActive
            ? 'rgba(255,255,255,1)'
            : 'rgba(245,252,255,1)',
        }}>
        <Animatable.View
          style={{
            marginLeft: 5,
            marginTop: 5,
            marginBottom: 5,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Animatable.Text style={{fontSize: 20, fontWeight: 'bold'}}>
            {section.title}
          </Animatable.Text>
          <EvilIcons
            name={isActive ? 'chevron-up' : 'chevron-down'}
            size={30}
          />
        </Animatable.View>
      </Animatable.View>
    );
  }
  _renderContent = (section, i, isActive, sections) => {
    return (
      <Animatable.View
        duration={300}
        transition="backgroundColor"
        style={{
          backgroundColor: isActive
            ? 'rgba(255,255,255,1)'
            : 'rgba(245,252,255,1)',
          flexDirection: 'column',
          justifyContent: 'center',
          margin: 5,
        }}>
        <Animatable.View style={styles.orderDetails}>
          <Animatable.View
            duration={5000}
            animation={isActive && this.state.isOrderPlaced ? 'tada' : false}>
            <Entypo
              name="controller-record"
              color={isActive && this.state.isOrderPlaced ? 'green' : 'gray'}
              size={25}
            />
          </Animatable.View>

          <Animatable.Text
            duration={500}
            easing="ease-out"
            style={styles.deliverText}
            animation={isActive ? 'zoomIn' : false}>
            Order Placed{' '}
          </Animatable.Text>
          <Animatable.Text
            duration={600}
            easing="linear"
            style={{fontSize: 12}}
            animation={isActive ? 'pulse' : false}>
            {'at ' +
              format(
                new Date(this.props.route.params.orderDetails.orderTime),
                'dd MMM yyyy hh:mma',
              )}
          </Animatable.Text>
        </Animatable.View>
        <Animatable.View style={styles.orderDetails}>
          <Animatable.View
            duration={5000}
            animation={
              isActive && this.state.isOrderPlaced && this.state.isOrderPacked
                ? 'tada'
                : false
            }>
            <Entypo
              name="controller-record"
              color={
                isActive && this.state.isOrderPlaced && this.state.isOrderPacked
                  ? 'green'
                  : 'gray'
              }
              size={25}
            />
          </Animatable.View>
          <Animatable.Text
            duration={500}
            easing="ease-out"
            style={styles.deliverText}
            animation={
              isActive && this.state.isOrderPlaced && this.state.isOrderPacked
                ? 'zoomIn'
                : false
            }>
            Order Packed{' '}
          </Animatable.Text>
          {this.props.route.params.orderDetails.orderPackedTime ? (
            <Animatable.Text
              duration={600}
              easing="linear"
              style={{fontSize: 12}}
              animation={isActive ? 'pulse' : false}>
              {format(
                new Date(this.props.route.params.orderDetails.orderPackedTime),
                'dd MMM yyyy hh:mma',
              )}
            </Animatable.Text>
          ) : null}
        </Animatable.View>
        <Animatable.View style={styles.orderDetails}>
          <Animatable.View
            duration={5000}
            animation={
              isActive &&
              this.state.isOrderPlaced &&
              this.state.isOrderPacked &&
              this.state.isOrderDispatched
                ? 'tada'
                : false
            }>
            <Entypo
              name="controller-record"
              color={
                isActive &&
                this.state.isOrderPlaced &&
                this.state.isOrderPacked &&
                this.state.isOrderDispatched
                  ? 'green'
                  : 'gray'
              }
              size={25}
            />
          </Animatable.View>
          <Animatable.Text
            duration={500}
            easing="ease-out"
            style={styles.deliverText}
            animation={
              isActive &&
              this.state.isOrderPlaced &&
              this.state.isOrderPacked &&
              this.state.isOrderDispatched
                ? 'zoomIn'
                : false
            }>
            Dispatched{' '}
          </Animatable.Text>
          {this.props.route.params.orderDetails.dispatchedTime ? (
            <Animatable.Text
              duration={600}
              easing="linear"
              style={{fontSize: 12}}
              animation={isActive ? 'pulse' : false}>
              {format(
                new Date(this.props.route.params.orderDetails.dispatchedTime),
                'dd MMM yyyy hh:mma',
              )}
            </Animatable.Text>
          ) : null}
        </Animatable.View>
        <Animatable.View style={styles.orderDetails}>
          <Animatable.View
            duration={5000}
            animation={
              isActive &&
              this.state.isOrderPlaced &&
              this.state.isOrderPacked &&
              this.state.isOrderDispatched &&
              this.state.isOrderOutForDelivery
                ? 'tada'
                : false
            }>
            <Entypo
              name="controller-record"
              color={
                isActive &&
                this.state.isOrderPlaced &&
                this.state.isOrderPacked &&
                this.state.isOrderDispatched &&
                this.state.isOrderOutForDelivery
                  ? 'green'
                  : 'gray'
              }
              size={25}
            />
          </Animatable.View>
          <Animatable.Text
            duration={500}
            easing="ease-out"
            style={styles.deliverText}
            animation={
              isActive &&
              this.state.isOrderPlaced &&
              this.state.isOrderPacked &&
              this.state.isOrderDispatched &&
              this.state.isOrderOutForDelivery
                ? 'zoomIn'
                : false
            }>
            Out for Delivery{' '}
          </Animatable.Text>
          {this.props.route.params.orderDetails.outForDeliveryTime ? (
            <Animatable.Text
              duration={600}
              easing="linear"
              style={{fontSize: 12}}
              animation={isActive ? 'pulse' : false}>
              {format(
                new Date(
                  this.props.route.params.orderDetails.outForDeliveryTime,
                ),
                'dd MMM yyyy hh:mma',
              )}
            </Animatable.Text>
          ) : null}
        </Animatable.View>
        <Animatable.View style={styles.orderDetails}>
          <Animatable.View
            duration={5000}
            animation={
              isActive &&
              this.state.isOrderPlaced &&
              this.state.isOrderPacked &&
              this.state.isOrderDispatched &&
              this.state.isOrderOutForDelivery &&
              this.state.isOrderDelivered
                ? 'tada'
                : false
            }>
            <Entypo
              name="controller-record"
              color={
                isActive &&
                this.state.isOrderPlaced &&
                this.state.isOrderPacked &&
                this.state.isOrderDispatched &&
                this.state.isOrderOutForDelivery &&
                this.state.isOrderDelivered
                  ? 'green'
                  : 'gray'
              }
              size={25}
            />
          </Animatable.View>
          <Animatable.Text
            duration={500}
            style={styles.deliverText}
            easing="ease-out"
            animation={isActive ? 'zoomIn' : false}>
            Order Delivered{' '}
          </Animatable.Text>
          {this.props.route.params.orderDetails.deliveryTime ? (
            <Animatable.Text
              duration={600}
              easing="linear"
              style={{fontSize: 12}}
              animation={isActive ? 'pulse' : false}>
              {this.props.route.params.orderDetails.isOrderDelivered
                ? 'at ' +
                  format(
                    new Date(this.props.route.params.orderDetails.deliveryTime),
                    'dd MMM yyyy hh:mma',
                  )
                : 'on or before ' +
                  format(
                    new Date(this.props.route.params.orderDetails.deliveryTime),
                    'dd MMM yyyy hh:mma',
                  )}
            </Animatable.Text>
          ) : null}
        </Animatable.View>
        {/* Order Cancelled */}
        {this.state.orderDetails.totalorderPrice === 0 ? (
          <Animatable.View style={styles.orderDetails}>
            <Animatable.View
              duration={5000}
              animation={
                isActive &&
                this.state.isOrderPlaced &&
                this.state.isOrderPacked &&
                this.state.isOrderDispatched &&
                this.state.isOrderOutForDelivery &&
                this.state.isOrderDelivered
                  ? 'tada'
                  : false
              }>
              <Entypo
                name="controller-record"
                color={isActive ? 'red' : 'gray'}
                size={25}
              />
            </Animatable.View>
            <Animatable.Text
              duration={500}
              style={styles.deliverText}
              easing="ease-out"
              animation={isActive ? 'zoomIn' : false}>
              Order Cancelled{' '}
            </Animatable.Text>
          </Animatable.View>
        ) : null}
        {/* Order Return */}
        {this._renderReturnDeliveryDetails(isActive)}
      </Animatable.View>
    );
  };
  _renderReturnDeliveryDetails(isActive) {
    return (
      <FlatList
        data={this.state.orderDetails.orderDetail}
        scrollEnabled={true}
        keyExtractor={item => item._id}
        renderItem={({item, index}) => (
          <Animatable.View>
            {item.isOrderReturnablePlaced ? (
              <Animatable.View>
                {this.state.orderDetails.orderDetail &&
                this.state.orderDetails.orderDetail.length > 1 ? (
                  <Animatable.Text style={{fontSize: 16, fontWeight: 'bold'}}>
                    <Animatable.Text
                      style={{fontSize: 16, fontWeight: 'normal'}}>
                      Refund Product:
                    </Animatable.Text>{' '}
                    {item.name && item.name.length > 20
                      ? item.name.slice(0, 20) + '...'
                      : item.name}
                  </Animatable.Text>
                ) : null}
                <Animatable.View style={styles.orderDetails}>
                  <Animatable.View
                    duration={5000}
                    animation={
                      isActive && item.isOrderReturnablePlaced ? 'tada' : false
                    }>
                    <Entypo
                      name="controller-record"
                      color={
                        isActive && item.isOrderReturnablePlaced
                          ? 'orange'
                          : 'gray'
                      }
                      size={25}
                    />
                  </Animatable.View>

                  <Animatable.Text
                    duration={500}
                    easing="ease-out"
                    style={styles.deliverText}
                    animation={isActive ? 'zoomIn' : false}>
                    Return Proccessed{' '}
                  </Animatable.Text>
                  <Animatable.Text
                    duration={600}
                    easing="linear"
                    style={{fontSize: 12}}
                    animation={isActive ? 'pulse' : false}>
                    {'at ' +
                      format(
                        new Date(item.orderReturnablePlacedTime),
                        'dd MMM yyyy hh:mma',
                      )}
                  </Animatable.Text>
                </Animatable.View>
                <Animatable.View style={styles.orderDetails}>
                  <Animatable.View
                    duration={5000}
                    animation={
                      isActive &&
                      item.isOrderReturnablePlaced &&
                      item.isOrderReturnOutForPicked
                        ? 'tada'
                        : false
                    }>
                    <Entypo
                      name="controller-record"
                      color={
                        isActive &&
                        item.isOrderReturnablePlaced &&
                        item.isOrderReturnOutForPicked
                          ? 'green'
                          : 'gray'
                      }
                      size={25}
                    />
                  </Animatable.View>
                  <Animatable.Text
                    duration={500}
                    easing="ease-out"
                    style={styles.deliverText}
                    animation={
                      isActive &&
                      item.isOrderReturnablePlaced &&
                      item.isOrderReturnOutForPicked
                        ? 'zoomIn'
                        : false
                    }>
                    Out for Pickup{' '}
                  </Animatable.Text>
                  {item.orderReturnOutForPickedTime ? (
                    <Animatable.Text
                      duration={600}
                      easing="linear"
                      style={{fontSize: 12}}
                      animation={isActive ? 'pulse' : false}>
                      {format(
                        new Date(item.orderReturnOutForPickedTime),
                        'dd MMM yyyy hh:mma',
                      )}
                    </Animatable.Text>
                  ) : null}
                </Animatable.View>
                <Animatable.View style={styles.orderDetails}>
                  <Animatable.View
                    duration={5000}
                    animation={
                      isActive &&
                      item.isOrderReturnablePlaced &&
                      item.isOrderReturnOutForPicked &&
                      item.isOrderReturnableDelivered
                        ? 'tada'
                        : false
                    }>
                    <Entypo
                      name="controller-record"
                      color={
                        isActive &&
                        item.isOrderReturnablePlaced &&
                        item.isOrderReturnOutForPicked &&
                        item.isOrderReturnableDelivered
                          ? 'green'
                          : 'gray'
                      }
                      size={25}
                    />
                  </Animatable.View>
                  <Animatable.Text
                    duration={500}
                    easing="ease-out"
                    style={styles.deliverText}
                    animation={
                      isActive &&
                      item.isOrderReturnablePlaced &&
                      item.isOrderReturnOutForPicked &&
                      item.isOrderReturnableDelivered
                        ? 'zoomIn'
                        : false
                    }>
                    Return Successfully
                  </Animatable.Text>
                  {item.orderReturnableDeliveredTime ? (
                    <Animatable.Text
                      duration={600}
                      easing="linear"
                      style={{fontSize: 12}}
                      animation={isActive ? 'pulse' : false}>
                      {format(
                        new Date(item.orderReturnableDeliveredTime),
                        'dd MMM yyyy hh:mma',
                      )}
                    </Animatable.Text>
                  ) : null}
                </Animatable.View>
              </Animatable.View>
            ) : null}
          </Animatable.View>
        )}
      />
    );
  }
  _updateSections = activeSections => {
    this.setState({activeSections});
  };

  toggleDialog = (text = '') => {
    this.setState({dialog: !this.state.dialog, dialogText: text});
  };
  updateCheckBox(value, index) {
    this.state.orderDetails.orderDetail[index].isChecked = value;
    this.setState({orderDetails: this.state.orderDetails});
  }
  _renderDialog() {
    return (
      <FlatList
        data={this.state.orderDetails.orderDetail}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item._id}
        renderItem={({item, index}) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 0.5,
            }}>
            <CheckBox
              disabled={
                (item.isOrderCancel && !item.isReturnable) || !item.isReturn
              }
              tintColors={{
                true: Color.primary,
                false:
                  (item.isOrderCancel && !item.isReturnable) || !item.isReturn
                    ? Color.lightGrey
                    : 'black',
              }}
              value={item.isChecked}
              onValueChange={value => {
                this.updateCheckBox(value, index);
              }}
            />
            <View style={{flexDirection: 'column', justifyContent: 'center'}}>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                {item.name}
              </Text>
              {item.isReturnable && !item.isOrderCancel ? (
                <View
                  style={{
                    flexDirection: 'row',
                    marginBottom: 5,
                    width: wp(75),
                  }}>
                  {!item.isReturn ? (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        flexWrap: 'wrap',
                        flex: 1,
                      }}>
                      {' '}
                      Return was accepted before{' '}
                      <Text style={{color: 'red'}}>
                        {formatRelative(new Date(item.returnTime), new Date(), {
                          lastWeek: '[letzten] dddd [um] LT',
                          yesterday: '[gestern um] LT',
                          today: '[heute um] LT',
                          tomorrow: '[morgen um] LT',
                          nextWeek: 'dddd [um] LT',
                        })}
                      </Text>
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        flexWrap: 'wrap',
                        flex: 1,
                      }}>
                      {' '}
                      Return will accept before{' '}
                      <Text style={{color: 'green'}}>
                        {formatRelative(new Date(item.returnTime), new Date(), {
                          lastWeek: '[letzten] dddd [um] LT',
                          yesterday: '[gestern um] LT',
                          today: '[heute um] LT',
                          tomorrow: '[morgen um] LT',
                          nextWeek: 'dddd [um] LT',
                        })}
                      </Text>
                    </Text>
                  )}
                </View>
              ) : !item.isOrderCancel && this.state.isOrderDelivered ? (
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: 'bold',
                    color: 'red',
                    marginBottom: 5,
                  }}>
                  {' '}
                  Not Returnable
                </Text>
              ) : null}
              {item.isOrderCancel ? (
                <Text
                  style={{fontSize: 16, fontWeight: 'bold', marginBottom: 5}}>
                  {' '}
                  Cancelled on{' '}
                  <Text style={{color: 'red'}}>
                    {formatRelative(new Date(item.cancelDate), new Date(), {
                      lastWeek: '[letzten] dddd [um] LT',
                      yesterday: '[gestern um] LT',
                      today: '[heute um] LT',
                      tomorrow: '[morgen um] LT',
                      nextWeek: 'dddd [um] LT',
                    })}
                  </Text>
                </Text>
              ) : null}
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
            <TouchableOpacity
              style={[
                styles.button,
                {backgroundColor: Color.warn, width: wp(25)},
              ]}
              onPress={() => {
                if (!this.state.dialogLoading) {
                  this.toggleDialog();
                }
              }}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                {backgroundColor: Color.primary, width: wp(25)},
              ]}
              onPress={() => {
                if (!this.state.dialogLoading) {
                  if (this.state.dialogText.includes('Return')) {
                    this.returnOrder();
                  } else {
                    this.cancelOrder();
                  }
                }
              }}>
              {this.state.dialogLoading ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <Text style={styles.buttonText}>Proceed</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      />
    );
  }
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
            }}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 5}}>
                {this.state.dialogText}
              </Text>
              <TouchableOpacity
                disabled={this.state.dialogLoading}
                onPress={this.toggleDialog}>
                <IoniIcons name="close-circle-outline" size={30} />
              </TouchableOpacity>
            </View>
            {this._renderDialog()}
          </View>
        </View>
      </Modal>
    );
  }
  async cancelOrder() {
    let params = {
        userId: await AsyncStorage.getItem('_id'),
        orderId: this.state.orderDetails.orderId,
        productId: [],
      },
      flag = false;
    this.state.orderDetails.orderDetail.forEach(e => {
      if (e.isChecked) {
        flag = true;
        params.productId.push(e._id);
      }
    });
    if (!flag) {
      Global.toasterMessage('You have to select atleast one item to cancel');
    } else {
      this.setState({dialogLoading: true});
      await axios
        .post(Global.apiURL + 'order/cancel-order', params)
        .then(res => {
          console.log(res.data);
          if (res.data && res.data.status) {
            this.setState({dialogLoading: false});
            this.toggleDialog();
            this.props.navigation.push('Orders', {
              refresh: true,
            });
          }
        })
        .catch(err => {
          this.setState({dialogLoading: false});
          console.log(
            err && err.response && err.response.data
              ? err.response.data.message
              : err.message,
          );
          Global.toasterMessage(
            err && err.response && err.response.data
              ? err.response.data.message
              : err.message,
          );
        });
    }
  }
  async returnOrder() {
    let params = {
        userId: await AsyncStorage.getItem('_id'),
        orderId: this.state.orderDetails.orderId,
        productId: [],
      },
      flag = false;
    this.state.orderDetails.orderDetail.forEach(e => {
      if (e.isChecked) {
        flag = true;
        params.productId.push(e._id);
      }
    });
    if (!flag) {
      Global.toasterMessage('You have to select atleast one item to return');
    } else {
      this.setState({dialogLoading: true});
      await axios
        .post(Global.apiURL + 'order/return-order', params)
        .then(res => {
          console.log(res.data);
          if (res.data && res.data.status) {
            this.setState({dialogLoading: false});
            this.toggleDialog();
            this.props.navigation.push('Orders', {
              refresh: true,
            });
          }
        })
        .catch(err => {
          this.setState({dialogLoading: false});
          console.log(
            err && err.response && err.response.data
              ? err.response.data.message
              : err.message,
          );
          Global.toasterMessage(
            err && err.response && err.response.data
              ? err.response.data.message
              : err.message,
          );
        });
    }
  }
  render() {
    return (
      <View style={styles.mainContainer}>
        {!!this.state.dialog && this.renderDialog()}
        <CardView cardElevation={5} style={styles.card}>
          <View style={styles.firstRow}>
            <Text style={styles.title}>Order Id: </Text>
            <Text style={styles.value}>{this.state.orderDetails.orderId}</Text>
          </View>
          {this.state.orderDetails.totalorderPrice > 0 ? (
            <View>
              <View style={styles.restRow}>
                <Text style={styles.title}>Order Amt: </Text>
                <Text
                  style={{
                    fontSize: 18,
                    alignSelf: 'center',
                  }}>
                  {'₹'}
                  {this.state.orderDetails.totalorderPrice}{' '}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: 'gray',
                    alignSelf: 'center',
                    textDecorationLine: 'line-through',
                  }}>
                  {'₹'}
                  {this.state.orderDetails.totaloriginalPrice}
                </Text>
                {this.state.orderDetails.totalofferPercentage !== '0.00%' ? (
                  <Text
                    style={{
                      fontSize: 15,
                      color: 'green',
                      fontWeight: 'bold',
                      alignSelf: 'center',
                    }}>
                    {' '}
                    {this.state.orderDetails.totalofferPercentage}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}
          {this.state.orderDetails.totalDeliveryCharge > 0 ? (
            <View style={styles.restRow}>
              <Text style={styles.title}>Shipping: </Text>
              <Text style={styles.value}>
                {'₹'}
                {this.state.orderDetails.totalDeliveryCharge}
              </Text>
            </View>
          ) : null}
          {this.state.orderDetails.totalorderPrice > 0 ? (
            <View>
              <View style={styles.restRow}>
                <Text style={styles.title}>Grand Amt: </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    alignSelf: 'center',
                  }}>
                  {'₹'}
                  {this.state.orderDetails.totalorderPrice +
                    this.state.orderDetails.totalDeliveryCharge}{' '}
                </Text>
              </View>
              <View style={styles.restRow}>
                <Text style={styles.title}>You Save: </Text>
                <Text
                  style={[styles.value, {color: 'red', fontWeight: 'bold'}]}>
                  {'₹'}
                  {Number(this.state.orderDetails.totaloriginalPrice) -
                    Number(this.state.orderDetails.totalorderPrice)}
                </Text>
              </View>
            </View>
          ) : null}
          {this.state.cancelAmt > 0 ? (
            <View style={styles.restRow}>
              <Text style={styles.title}>Refund Amt: </Text>
              <Text style={[styles.value, {fontWeight: 'bold'}]}>
                {'₹'}
                {this.state.cancelAmt}
              </Text>
            </View>
          ) : null}
          {this.props.route.params.orderDetails.paymentMethod ? (
            <View style={styles.restRow}>
              <Text style={styles.title}>Payment Method: </Text>
              <Text style={styles.value}>
                {this.props.route.params.orderDetails.paymentMethod}
              </Text>
            </View>
          ) : null}
          <View style={styles.restRow}>
            <Text style={styles.title}>Order Date: </Text>
            <Text style={[styles.value, {fontSize: 14, fontWeight: 'bold'}]}>
              {format(
                new Date(this.props.route.params.orderDetails.orderTime),
                'EEEE, do MMM yyyy p',
              )}
            </Text>
          </View>
          {this.props.route.params.orderDetails.deliveryTime &&
          new Date(this.props.route.params.orderDetails.deliveryTime) >=
            new Date() ? (
            <View style={[styles.restRow, {marginBottom: 10}]}>
              <Text style={styles.title}>Estimate Delivery: </Text>
              <Text
                style={[
                  styles.value,
                  {color: 'green', fontSize: 14, fontWeight: 'bold'},
                ]}>
                {format(
                  new Date(this.props.route.params.orderDetails.deliveryTime),
                  'EEEE, do MMM yyyy p',
                )}
              </Text>
            </View>
          ) : this.props.route.params.orderDetails.isOrderDelivered ? (
            <View style={[styles.restRow, {marginBottom: 10}]}>
              <Text style={styles.title}>Order Delivered: </Text>
              <Text style={[styles.value, {color: 'green'}]}>
                {format(
                  new Date(this.props.route.params.orderDetails.deliveryTime),
                  'EEEE, do MMM yyyy p',
                )}
              </Text>
            </View>
          ) : (
            <View style={{marginBottom: 5}} />
          )}
        </CardView>
        <CardView cardElevation={5} style={styles.card}>
          <Accordion
            sections={SECTIONS}
            activeSections={this.state.activeSections}
            renderSectionTitle={this._renderSectionTitle}
            renderHeader={this._renderHeader}
            renderContent={this._renderContent}
            onChange={this._updateSections}
          />
        </CardView>
        <ScrollView showsVerticalScrollIndicator={false}>
          {this._renderOrder()}
          <CardView cardElevation={5} style={styles.card}>
            <View style={styles.firstRow}>
              <Text style={styles.title}>Shipping Address: </Text>
            </View>
            <View style={styles.restRow}>
              <Text style={styles.title}>Name: </Text>
              <Text style={styles.value}>
                {this.state.orderDetails &&
                this.state.orderDetails.addressDetail &&
                this.state.orderDetails.addressDetail.name
                  ? this.state.orderDetails.addressDetail.name
                  : ''}
              </Text>
            </View>
            <View style={styles.restRow}>
              <Text style={styles.title}>Ph: </Text>
              <Text style={styles.value}>
                {this.state.orderDetails &&
                this.state.orderDetails.addressDetail &&
                this.state.orderDetails.addressDetail.ph
                  ? '+91-' + this.state.orderDetails.addressDetail.ph
                  : ''}
              </Text>
            </View>
            <View style={styles.restRow}>
              <Text style={styles.title}>State: </Text>
              <Text style={styles.value}>
                {this.state.orderDetails &&
                this.state.orderDetails.addressDetail &&
                this.state.orderDetails.addressDetail.state
                  ? this.state.orderDetails.addressDetail.state
                  : ''}
              </Text>
            </View>
            <View style={styles.restRow}>
              <Text style={styles.title}>City: </Text>
              <Text style={styles.value}>
                {this.state.orderDetails &&
                this.state.orderDetails.addressDetail &&
                this.state.orderDetails.addressDetail.city
                  ? this.state.orderDetails.addressDetail.city
                  : ''}
              </Text>
            </View>
            <View
              style={[
                styles.restRow,
                {
                  marginBottom:
                    this.state.orderDetails &&
                    this.state.orderDetails.addressDetail &&
                    this.state.orderDetails.addressDetail.area
                      ? 0
                      : 5,
                },
              ]}>
              <Text style={styles.title}>Pin: </Text>
              <Text style={styles.value}>
                {this.state.orderDetails &&
                this.state.orderDetails.addressDetail &&
                this.state.orderDetails.addressDetail.pin
                  ? this.state.orderDetails.addressDetail.pin
                  : ''}
              </Text>
            </View>
            {this.state.orderDetails &&
            this.state.orderDetails.addressDetail &&
            this.state.orderDetails.addressDetail.area ? (
              <View style={styles.restRow}>
                <Text style={styles.title}>Area/Locality: </Text>
                <Text style={styles.value}>
                  {this.state.orderDetails.addressDetail.area}
                </Text>
              </View>
            ) : null}
            {this.state.orderDetails &&
            this.state.orderDetails.addressDetail &&
            this.state.orderDetails.addressDetail.landmark ? (
              <View style={[styles.restRow, {marginBottom: 5}]}>
                <Text style={styles.title}>Landmark: </Text>
                <Text style={styles.value}>
                  {this.state.orderDetails.addressDetail.landmark}
                </Text>
              </View>
            ) : null}
          </CardView>
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <TouchableOpacity
              style={[styles.button, {backgroundColor: Color.lightGrey}]}
              onPress={() => {
                if (this.state.isOrderDelivered) {
                  this.toggleDialog('Return Order');
                } else {
                  if (
                    this.state.orderDetails.orderDetail &&
                    this.state.orderDetails.orderDetail.length > 1
                  ) {
                    Global.toasterMessage(
                      'Order is not delivered, so it can not be return',
                    );
                  } else {
                    Global.toasterMessage(
                      `${this.state.orderDetails.orderDetail[0].name} is not delivered, so it can not be return`,
                    );
                  }
                }
              }}>
              <Text style={[styles.buttonText, {color: 'black'}]}>Return</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, {backgroundColor: Color.warn}]}
              onPress={() => {
                if (!this.state.isOrderDelivered) {
                  if (!this.state.isOrderOutForDelivery) {
                    this.toggleDialog('Cancel Order');
                  } else {
                    if (
                      this.state.orderDetails.orderDetail &&
                      this.state.orderDetails.orderDetail.length > 1
                    ) {
                      Global.toasterMessage(
                        'Order is out for delivery, so it can not be cancelled',
                      );
                    } else {
                      Global.toasterMessage(
                        `${this.state.orderDetails.orderDetail[0].name} is out for delivery, so it can not be cancelled`,
                      );
                    }
                  }
                } else {
                  if (
                    this.state.orderDetails.orderDetail &&
                    this.state.orderDetails.orderDetail.length > 1
                  ) {
                    Global.toasterMessage(
                      'Order is delivered, so it can not be cancelled',
                    );
                  } else {
                    Global.toasterMessage(
                      `${this.state.orderDetails.orderDetail[0].name} is delivered, so it can not be cancelled`,
                    );
                  }
                }
              }}>
              <Text style={styles.buttonText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              margin: 5,
              borderBottomWidth: 0.5,
            }}>
            Customers Who Bought Items in Your Order Also Bought
          </Text>
          {/* Marketing Products */}
        </ScrollView>
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
  card: {margin: 10, backgroundColor: 'white'},
  firstRow: {
    flexDirection: 'row',
    marginLeft: 5,
    marginTop: 5,
    alignItems: 'center',
  },
  restRow: {flexDirection: 'row', marginLeft: 5, alignItems: 'center'},
  title: {fontSize: 18, fontWeight: 'bold'},
  value: {fontSize: 16},
  checkFlatList: {
    flex: 1,
    flexGrow: 0,
    minHeight: hp(22),
    flexDirection: 'row',
  },
  checkoutContainer: {
    width: wp(95),
    maxHeight: hp(22),
    backgroundColor: 'white',
    margin: hp(1),
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  verticleLine: {
    height: 50,
    marginLeft: 10,
    width: 1,
    backgroundColor: '#909090',
  },
  deliverText: {fontSize: 16, alignSelf: 'center'},
  button: {
    width: 180,
    height: 40,
    margin: 5,
    borderRadius: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
  },
});

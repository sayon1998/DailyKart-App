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
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {StackActions} from '@react-navigation/native';
import Global from '../../services/global';
import CardView from 'react-native-cardview';
import {format} from 'date-fns';
import Icon from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Accordion from 'react-native-collapsible/Accordion';
import * as Animatable from 'react-native-animatable';
import Slider from '@react-native-community/slider';

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
    };
  }
  getOrderDetails() {
    // console.log(JSON.stringify(this.props.route.params.orderDetails));
    this.setState({
      orderDetails: this.props.route.params.orderDetails,
      isOrderPlaced: this.props.route.params.orderDetails.isOrderPlaced,
      isOrderPacked: this.props.route.params.orderDetails.isOrderPacked,
      isOrderDispatched: this.props.route.params.orderDetails.isOrderDispatched,
      isOrderOutForDelivery:
        this.props.route.params.orderDetails.isOrderOutForDelivery,
      isOrderDelivered: this.props.route.params.orderDetails.isOrderDelivered,
    });
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
      });
      this.getOrderDetails();
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
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
                        Company:{' '}
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
    return <View />;
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
        <View
          style={{
            margin: 5,
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderBottomWidth: 0.5,
          }}>
          <Text style={{fontSize: 20, fontWeight: 'bold'}}>
            {section.title}
          </Text>
          <EvilIcons
            name={isActive ? 'chevron-up' : 'chevron-down'}
            size={30}
          />
        </View>
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
        }}>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            margin: 10,
          }}>
          <View style={styles.orderDetails}>
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
                  new Date(
                    this.props.route.params.orderDetails.orderDetail[0].orderTime,
                  ),
                  'dd MMM yyyy hh:mma',
                )}
            </Animatable.Text>
          </View>
          <View style={styles.orderDetails}>
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
                  isActive &&
                  this.state.isOrderPlaced &&
                  this.state.isOrderPacked
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
            <Animatable.Text
              duration={600}
              easing="linear"
              style={{fontSize: 12}}
              animation={isActive ? 'pulse' : false}>
              17th sep 2021 8:00Pm
            </Animatable.Text>
          </View>
          <View style={styles.orderDetails}>
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
            <Animatable.Text
              duration={600}
              easing="linear"
              style={{fontSize: 12}}
              animation={isActive ? 'pulse' : false}>
              17th sep 2021 8:00Pm
            </Animatable.Text>
          </View>
          <View style={styles.orderDetails}>
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
            <Animatable.Text
              duration={600}
              easing="linear"
              style={{fontSize: 12}}
              animation={isActive ? 'pulse' : false}>
              17th sep 2021 8:00Pm
            </Animatable.Text>
          </View>
          <View style={styles.orderDetails}>
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
            <Animatable.Text
              duration={600}
              easing="linear"
              style={{fontSize: 12}}
              animation={isActive ? 'pulse' : false}>
              {'on or before ' +
                format(
                  new Date(
                    this.props.route.params.orderDetails.orderDetail[0].deliveryTime,
                  ),
                  'dd MMM yyyy hh:mma',
                )}
            </Animatable.Text>
          </View>
        </View>
      </Animatable.View>
    );
  };

  _updateSections = activeSections => {
    this.setState({activeSections});
  };
  render() {
    return (
      <View style={styles.mainContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <CardView cardElevation={5} style={styles.card}>
            <View style={styles.firstRow}>
              <Text style={styles.title}>Order Id: </Text>
              <Text style={styles.value}>
                {this.state.orderDetails.orderId}
              </Text>
            </View>
            <View style={styles.restRow}>
              <Text style={styles.title}>Total Amt: </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
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
            <View style={[styles.restRow, {marginBottom: 5}]}>
              <Text style={styles.title}>Order Date: </Text>
              <Text style={styles.value}>
                {format(
                  new Date(
                    this.props.route.params.orderDetails.orderDetail[0].orderTime,
                  ),
                  'EEEE, do MMM yyyy p',
                )}
              </Text>
            </View>
          </CardView>
          {this._renderOrder()}
          <CardView cardElevation={5} style={styles.card}>
            <View style={styles.firstRow}>
              <Text style={styles.title}>Address Details: </Text>
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
});

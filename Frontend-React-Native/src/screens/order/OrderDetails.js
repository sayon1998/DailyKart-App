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
    };
  }
  getOrderDetails() {
    // console.log(JSON.stringify(this.props.route.params.orderDetails));
    this.setState({orderDetails: this.props.route.params.orderDetails});
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
          <Text style={{fontSize: 18, fontWeight: 'bold'}}>
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

  _renderContent(section, i, isActive, sections) {
    return (
      <Animatable.View
        duration={300}
        transition="backgroundColor"
        style={{
          backgroundColor: isActive
            ? 'rgba(255,255,255,1)'
            : 'rgba(245,252,255,1)',
        }}>
        <Animatable.Text
          duration={300}
          easing="ease-out"
          animation={isActive ? 'zoomIn' : false}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{transform: [{rotate: '-90deg'}]}}>
              <Slider
                style={{
                  position: 'relative',
                  width: wp(50),
                  height: 40,
                }}
                minimumValue={0}
                value={50}
                vertical={true}
                maximumValue={100}
                minimumTrackTintColor="#00FF00"
                maximumTrackTintColor="#000000"
              />
            </View>
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: 'red',
                width: wp(95),
              }}>
              <View style={styles.orderDetails}>
                <Text>Order Placed</Text>
                <Text>Hello</Text>
              </View>
              <View style={styles.orderDetails}>
                <Text>Order Packed</Text>
              </View>
              <View style={styles.orderDetails}>
                <Text>Dispatched</Text>
              </View>
              <View style={styles.orderDetails}>
                <Text>Out for Delivery</Text>
              </View>
              <View style={styles.orderDetails}>
                <Text>Order Delivered</Text>
              </View>
            </View>
          </View>
        </Animatable.Text>
      </Animatable.View>
    );
  }

  _updateSections = activeSections => {
    this.setState({activeSections});
  };
  render() {
    return (
      <View style={styles.mainContainer}>
        <CardView cardElevation={5} style={styles.card}>
          <View style={styles.firstRow}>
            <Text style={styles.title}>Order Id: </Text>
            <Text style={styles.value}>{this.state.orderDetails.orderId}</Text>
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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

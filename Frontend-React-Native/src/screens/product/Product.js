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
  Dimensions,
  Text,
  ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {StackActions} from '@react-navigation/native';
import Global, {address} from '../../services/global';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import Color from '../../services/color';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import CardView from 'react-native-cardview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheetHandler from '../../services/BottomSheetHandler';

const {width, height} = Dimensions.get('window');

export default class Product extends Component {
  constructor(props) {
    super();
    this.state = {
      isLoading: true,
      productDetail: [],
      sliderWidth: width,
      itemWidth: width,
      entries: [],
      activeSlide: 0,
      address: '',
      addressName: '',
      pin: '',
      addressId: 0,
      ph: '',
      city: '',
      cityArray: [],
      dist: '',
      state: '',
      locationContainerOpen: false,
      apiCall: 0,
      deliveryColor: '',
      deliveryMsg: '',
      cartFlag: false,
      cartLoading: false,
      sheetType: '',
    };
    this.handler = this.handler.bind(this);
  }
  componentDidMount() {
    // Comment on Production
    this.getProductDetails();
    // Comment End
    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      console.log('Product Details');
      this.getProductDetails();
      this.handler = this.handler.bind(this);
      this.setState({
        isLoading: true,
        productDetail: [],
        sliderWidth: width,
        itemWidth: width,
        entries: [],
        activeSlide: 0,
        address: '',
        addressName: '',
        pin: '',
        addressId: 0,
        ph: '',
        city: '',
        cityArray: [],
        dist: '',
        state: '',
        locationContainerOpen: false,
        apiCall: 0,
        deliveryColor: '',
        deliveryMsg: '',
        cartFlag: false,
        cartLoading: false,
        sheetType: '',
      });
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  handler() {
    if (this.state.sheetType === 'order') {
      this.setState({
        locationContainerOpen: false,
        sheetType: '',
      });
    } else {
      this.setState({
        locationContainerOpen: false,
        sheetType: '',
      });
      address.subscribe(async res => {
        if (res && res.pin && this.state.apiCall === 0) {
          console.log(res);
          this.setState({
            addressId: res.addressId ? res.addressId : 0,
            addressName: res.name,
            ph: res.ph ? res.ph : await AsyncStorage.getItem('ph'),
            city: res.city[0],
            cityArray: res.city,
            dist: res.dist,
            state: res.state,
            address:
              (res.area ? res.area + ', ' : '') +
              ', City- ' +
              res.city[0] +
              ', Dist- ' +
              res.dist +
              ', State- ' +
              res.state +
              ', Pin- ' +
              res.pin,
            pin: res.pin,
            apiCall: 1,
            deliveryColor: '',
            deliveryMsg: '',
          });
          this.getLocationAvailability(res.pin);
        }
      });
    }
  }
  async getLocationAvailability(pin) {
    await axios
      .get(
        Global.apiURL +
          `address/address-deliveriable/${pin}/${this.props.route.params.productId}`,
      )
      .then(res => {
        console.log(res.data);
        if (res.data && res.data.status) {
          this.setState({
            deliveryColor: 'green',
            deliveryMsg: res.data.message,
          });
        } else {
          this.setState({
            deliveryColor: 'red',
            deliveryMsg: res.data.message,
          });
        }
      })
      .catch(err => {
        console.log(
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message,
        );
      });
  }
  async getProductDetails() {
    await axios
      .get(
        Global.apiURL +
          'product/productbyid/' +
          this.props.route.params.productId,
      )
      .then(async res => {
        if (res.data && res.data.status) {
          if (res.data.data) {
            res.data.data.qtyArray = [];
            res.data.data.qty = 1;
            for (
              let i = res.data.data.minqty;
              i <= res.data.data.highestquentity;
              i++
            ) {
              res.data.data.qtyArray.push({label: `${i}`, value: i});
            }
            res.data.data.qty = res.data.data.minqty;
            this.setState({
              isLoading: false,
              productDetail: res.data.data,
              entries: res.data.data.imagelist,
            });
            await Global.checkCartList(this.state.productDetail._id).then(
              resData => {
                if (resData) {
                  this.setState({cartFlag: true});
                }
              },
            );
            if (await Global.isLoggedIn()) {
              await this.getAddress();
            }
          } else {
            this.setState({isLoading: false});
            this.props.navigation.navigate('Home');
          }
        }
      })
      .catch(err => {
        this.setState({isLoading: true});
        console.log(
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message,
        );
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
              addressId: res.data.data.addressId,
              addressName: res.data.data.name,
              ph: String(res.data.data.ph),
              city: res.data.data.city,
              cityArray: [res.data.data.city],
              dist: res.data.data.dist,
              state: res.data.data.state,
              address:
                (res.data.data && res.data.data.area
                  ? res.data.data.area + ', '
                  : '') +
                'City- ' +
                res.data.data.city +
                ', Dist- ' +
                res.data.data.dist +
                ', State- ' +
                res.data.data.state +
                ', Pin- ' +
                res.data.data.pin,
              pin: String(res.data.data.pin),
            });
            if (this.state.productDetail.quantity > 0) {
              this.getLocationAvailability(this.state.pin);
            }
          }
        })
        .catch(err => {
          console.warn(err.response.data.message);
        });
    }
  }
  _renderBannerItem = ({item, index}) => {
    return (
      <View style={styles.slide}>
        <Image style={{width: width, height: 300}} source={{uri: item}} />
      </View>
    );
  };
  pagination() {
    const {entries, activeSlide} = this.state;
    return (
      <Pagination
        dotsLength={entries.length}
        activeDotIndex={activeSlide}
        containerStyle={{
          height: 0,
          marginTop: -30,
          marginBottom: -30,
        }}
        dotContainerStyle={{height: 0, width: 0}}
        dotStyle={{
          width: 15,
          height: 5,
          borderRadius: 5,
          marginHorizontal: 8,
          position: 'relative',
          bottom: 20,
        }}
        inactiveDotStyle={
          {
            // Define styles for inactive dots here
          }
        }
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    );
  }
  toggleLocation = () => {
    this.setState({
      locationContainerOpen: !this.state.locationContainerOpen,
      apiCall: 0,
    });
  };
  locationRender = () => {
    return (
      <BottomSheetHandler
        navigate={this.props.navigation.navigate}
        addressData={{
          pin: this.state.pin,
          addressName: this.state.addressName,
          ph: this.state.ph,
          address: this.state.address,
          addressId: this.state.addressId,
          city: this.state.city,
          state: this.state.state,
          dist: this.state.dist,
        }}
        deliveryColor={this.state.deliveryColor}
        deliveryMsg={this.state.deliveryMsg}
        productDetail={this.state.productDetail}
        type={this.state.sheetType}
        toggle={this.state.locationContainerOpen}
        handler={this.handler}
      />
    );
  };
  async orderProduct() {
    console.log('Order Now');
    if (await Global.isLoggedIn()) {
      this.setState({sheetType: 'order'});
      this.toggleLocation();
    } else {
      this.props.navigation.navigate('Auth', {
        redirectPath: 'Product',
        redirectParams: this.state.productDetail._id,
      });
    }
  }
  async gotToCart() {
    if (this.state.cartFlag) {
      console.log('Go to Cart');
      this.props.navigation.navigate('Cart');
    } else {
      console.log('Add to Cart');
      this.setState({cartLoading: true});
      await Global.onClickCartWishList(
        'cartAdd',
        this.state.productDetail._id,
        this.state.productDetail.name,
      ).then(res => {
        if (res) {
          this.setState({cartLoading: false, cartFlag: true});
        } else {
          this.setState({cartLoading: false});
        }
      });
    }
  }
  render() {
    return (
      <View
        style={[
          styles.mainContainer,
          {justifyContent: this.state.isLoading ? 'center' : 'flex-start'},
        ]}>
        {!!this.state.locationContainerOpen && this.locationRender()}
        {this.state.isLoading ? (
          <ActivityIndicator
            style={{alignSelf: 'center'}}
            size="large"
            color={Color.primary}
          />
        ) : (
          <ScrollView scrollEnabled={true} showsVerticalScrollIndicator={false}>
            <View style={{height: 300, borderBottomWidth: 0.5}}>
              <Carousel
                ref={c => {
                  this._carousel = c;
                }}
                layout={'tinder'}
                layoutCardOffset={20}
                data={this.state.entries}
                renderItem={this._renderBannerItem}
                sliderWidth={this.state.sliderWidth}
                itemWidth={this.state.itemWidth}
                onSnapToItem={index => this.setState({activeSlide: index})}
                enableMomentum={true}
                loop={false}
              />
              {this.pagination()}
            </View>
            <View style={{margin: 5, borderBottomWidth: 0.5}}>
              <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                {this.state.productDetail.name}
              </Text>
              {this.state.productDetail.totalrating ? (
                <View style={{flexDirection: 'row'}}>
                  <Icon color="green" name="star" size={15} />
                  <Text
                    style={{
                      fontSize: 18,
                      marginLeft: 2,
                      fontWeight: 'bold',
                      color: 'green',
                    }}>
                    {this.state.productDetail.rating}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      marginLeft: 2,
                      fontWeight: 'bold',
                      color: 'green',
                    }}>
                    ({this.state.productDetail.totalrating})
                  </Text>
                </View>
              ) : null}
              <View style={{flexDirection: 'row'}}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                  {'₹'}
                  {this.state.productDetail.price}{' '}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: 'gray',
                    textDecorationLine: 'line-through',
                  }}>
                  {'₹'}
                  {this.state.productDetail.originalprice}
                </Text>
                {this.state.productDetail.offerpercentage !== '0' ? (
                  <Text
                    style={{
                      fontSize: 15,
                      color: 'green',
                      fontWeight: 'bold',
                    }}>
                    {' '}
                    {this.state.productDetail.offerpercentage + '%'}
                  </Text>
                ) : null}
                {this.state.productDetail.deliverycharge ? (
                  <Text
                    style={{
                      fontSize: 16,
                      color: 'red',
                    }}>
                    {' '}
                    {'+ ₹' + this.state.productDetail.deliverycharge}
                    <Text style={{fontSize: 16, color: 'black'}}>
                      {' '}
                      is delivery charge
                    </Text>
                  </Text>
                ) : null}
              </View>
              {this.state.productDetail.quantity <= 10 &&
              this.state.productDetail.quantity > 0 ? (
                <Text
                  style={{
                    fontSize: 18,
                    color: 'red',
                    fontWeight: 'bold',
                    marginBottom: 5,
                  }}>
                  Only {this.state.productDetail.quantity} Item is available in
                  stock.
                </Text>
              ) : this.state.productDetail.quantity === 0 ? (
                <Text
                  style={{
                    fontSize: 18,
                    color: 'red',
                    fontWeight: 'bold',
                    marginBottom: 5,
                  }}>
                  Item is out of stock.
                </Text>
              ) : null}
            </View>
            <View
              style={{
                flexDirection: 'column',
                margin: 5,
                borderBottomWidth: 0.5,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                  Description:{' '}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    textAlign: 'left',
                    flex: 1,
                    flexWrap: 'wrap',
                  }}>
                  {this.state.productDetail.description}
                </Text>
                <View />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                  Type:{'           '}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    flex: 1,
                    flexWrap: 'wrap',
                  }}>
                  {this.state.productDetail.type}
                </Text>
                <View />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                  Unit:{'             '}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    textAlign: 'left',
                    flex: 1,
                    flexWrap: 'wrap',
                  }}>
                  {this.state.productDetail.unit}
                </Text>
                <View />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                  Seller:{'          '}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    textAlign: 'left',
                    flex: 1,
                    flexWrap: 'wrap',
                    color: 'gray',
                  }}>
                  {this.state.productDetail.company}
                </Text>
                <View />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 5,
                }}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                  Return policy:{' '}
                </Text>
                <Text style={{fontSize: 15, textAlign: 'left', color: 'green'}}>
                  {this.state.productDetail.returnpolicy
                    ? this.state.productDetail.returnpolicy +
                      ' after successfully order delivered.'
                    : 'No return policy.'}
                </Text>
                <View />
              </View>
            </View>
            {/* Address */}
            <CardView
              key={0}
              style={[
                styles.cardContainer,
                {height: this.state.deliveryMsg ? 100 : 80},
              ]}
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
                    {this.state.ph ? (
                      <Text style={{alignSelf: 'flex-start', marginLeft: 5}}>
                        Ph: {'+91-' + this.state.ph}
                      </Text>
                    ) : null}
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
                  disabled={this.state.productDetail.quantity === 0}
                  style={[
                    styles.button,
                    {width: 100, height: 40, marginTop: 20},
                  ]}
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
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    flex: 0.8,
                    textAlign: 'center',
                    flexWrap: 'wrap',
                    color: this.state.deliveryColor
                      ? this.state.deliveryColor
                      : 'black',
                  }}>
                  {this.state.deliveryMsg
                    ? (this.state.deliveryColor === 'red'
                        ? 'Oops, Your '
                        : 'Hurrey, Your ') + this.state.deliveryMsg
                    : ''}
                </Text>
              </View>
            </CardView>
            {/* Similar Product */}
            <View
              style={{
                margin: 5,
                marginTop: 10,
                borderBottomWidth: 0.5,
              }}>
              <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 5}}>
                Similar Items
              </Text>
            </View>
          </ScrollView>
        )}
        {/* Bottom Container */}
        {this.state.isLoading ? null : (
          <View style={styles.bottomContainer}>
            <View style={styles.bottomMainRow}>
              <View
                style={{
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    style={styles.bottomContainerLeftbutton}
                    onPress={() => {
                      if (this.state.productDetail.quantity === 0) {
                        Global.toasterMessage('Item is Out of Stock', 'long');
                        return false;
                      }
                      this.gotToCart();
                    }}>
                    {!this.state.cartLoading ? (
                      <Text style={styles.bottomContainerButtonText}>
                        {this.state.cartFlag ? 'Go to Cart' : 'Add to Cart'}
                      </Text>
                    ) : (
                      <ActivityIndicator size="large" color="white" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.bottomContainerRightbutton}
                    onPress={() => {
                      if (this.state.productDetail.quantity === 0) {
                        Global.toasterMessage('Item is Out of Stock', 'long');
                        return false;
                      }
                      this.orderProduct();
                    }}>
                    <Text style={styles.bottomContainerButtonText}>Order</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
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
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  cardContainer: {
    width: wp(95),
    height: 80,
    alignSelf: 'center',
    backgroundColor: 'white',
  },
  bottomContainer: {
    width: width,
    height: 60,
    bottom: 0,
    justifyContent: 'space-between',
    position: 'relative',
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
  bottomContainerLeftbutton: {
    width: width / 2,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.warn,
    borderRightWidth: 0.5,
  },
  bottomContainerRightbutton: {
    width: width / 2,
    height: 60,
    borderLeftWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.primary,
  },
  bottomContainerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

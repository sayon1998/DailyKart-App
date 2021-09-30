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
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
  Button,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Global from '../../services/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SkeletonContent from 'react-native-skeleton-content-nonexpo';
import Color from '../../services/color';
import Icon from 'react-native-vector-icons/Ionicons';
import CardView from 'react-native-cardview';
import CheckBox from '@react-native-community/checkbox';

const {width, height} = Dimensions.get('window');

export default class Wishlist extends Component {
  constructor() {
    super();
    this.state = {
      wishLists: [],
      isLoading: true,
      name: '',
      noProduct: false,
    };
  }
  componentDidMount() {
    // ######### Comment for Production #########
    // this.getWishlistDetails();
    //  ########## End Comment ##########
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      console.log('Wishlist Listener');
      this.setState({
        wishLists: [],
        isLoading: true,
        name: '',
        noProduct: false,
        dialog: false,
        dialogText: '',
        dialogType: '',
        dialogItems: [],
        dialogLoading: false,
        bottomContainerOpen: false,
        selectAll: false,
        moveCart: [],
      });
      this.getWishlistDetails();
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  getWishlistDetails = async () => {
    let wishList = [];
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
            )}/wishlist`,
        )
        .then(async response => {
          //   console.log(response.data.status);
          if (response.data && response.data.status) {
            if (
              response.data.data &&
              response.data.data.wishlist &&
              response.data.data.wishlist.length > 0
            ) {
              wishList = response.data.data.wishlist;
              await AsyncStorage.setItem('wishList', JSON.stringify(wishList));
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
      wishList = JSON.parse(await AsyncStorage.getItem('wishList'))
        ? JSON.parse(await AsyncStorage.getItem('wishList'))
        : [];
    }
    if (wishList && wishList.length > 0) {
      let params = {
        product: wishList,
      };
      await axios
        .post(Global.apiURL + 'product/productbymultipleid', params)
        .then(response => {
          //   console.log(response.data);
          if (response.data && response.data.status) {
            if (response.data.data && response.data.data.length > 0) {
              response.data.data.forEach(e => {
                e.isChecked = false;
              });
              this.setState({
                isLoading: false,
                refresh: false,
                wishLists: response.data.data,
              });
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
          console.log(err.message);
        });
    } else {
      this.setState({isLoading: false, refresh: false, noProduct: true});
    }
  };
  refreshHandler = async () => {
    this.setState({refresh: true}, () => {
      this.getWishlistDetails();
    });
  };
  toggleDialog = (type = '', text = '', items) => {
    if (type === 'wishlistDeleteAll' || type === 'moveToCartAll') {
      if (this.state.selectAll) {
        this.setState({
          dialog: !this.state.dialog,
          dialogText: text,
          dialogItems: items,
          dialogType: type,
        });
      } else {
        let tempWish = [];
        items.forEach(e => {
          if (e.isChecked) {
            tempWish.push(e);
          }
        });
        this.setState({
          dialog: !this.state.dialog,
          dialogText: text,
          dialogItems: tempWish,
          dialogType: type,
        });
      }
    } else {
      this.setState({
        dialog: !this.state.dialog,
        dialogText: text,
        dialogItems: items,
        dialogType: type,
      });
    }
  };
  performAction = async (id, name) => {
    console.log('I am doing the thing');
    if (this.state.dialogType === 'delete') {
      await Global.onClickCartWishList('wishlistDelete', id, name).then(
        value => {
          if (value) {
            let tempWishList = [];
            this.state.wishLists.forEach(x => {
              if (x._id !== id) {
                tempWishList.push(x);
              }
            });
            if (tempWishList && tempWishList.length > 0) {
              this.setState({
                wishLists: tempWishList,
                dialog: !this.state.dialog,
                dialogType: '',
                dialogLoading: false,
              });
            } else {
              this.setState({
                wishLists: [],
                noProduct: true,
                dialog: !this.state.dialog,
                dialogType: '',
                dialogLoading: false,
              });
            }
          }
        },
      );
    } else if (this.state.dialogType === 'move') {
      await Global.onClickMoveToCartWishlist('moveToCart', id, name).then(
        res => {
          console.log(res);
          if (res) {
            let tempWishList = [];
            this.state.wishLists.forEach(x => {
              if (x._id !== id) {
                tempWishList.push(x);
              }
            });
            if (tempWishList && tempWishList.length > 0) {
              this.setState({
                wishLists: tempWishList,
                dialog: !this.state.dialog,
                dialogType: '',
                dialogLoading: false,
              });
            } else {
              this.setState({
                wishLists: [],
                noProduct: true,
                dialog: !this.state.dialog,
                dialogType: '',
                dialogLoading: false,
              });
            }
          } else {
            this.setState({
              dialog: !this.state.dialog,
              dialogType: '',
              dialogLoading: false,
            });
          }
        },
      );
    } else if (this.state.dialogType === 'wishlistDeleteAll') {
      let idArray = [];
      this.state.dialogItems.forEach(e => {
        idArray.push(e._id);
      });
      await Global.onClickCartWishList(this.state.dialogType, idArray, '').then(
        res => {
          if (res) {
            if (this.state.selectAll) {
              this.setState({
                wishLists: [],
                dialog: !this.state.dialog,
                dialogItems: [],
                dialogType: '',
                dialogLoading: false,
                noProduct: true,
              });
            } else {
              let tempArray = [];
              this.state.wishLists.forEach(e => {
                if (
                  this.state.dialogItems.findIndex(x => x._id === e._id) === -1
                ) {
                  tempArray.push(e);
                }
              });
              this.setState({
                wishLists: tempArray,
                dialog: !this.state.dialog,
                dialogItems: [],
                dialogType: '',
                dialogLoading: false,
              });
            }
          } else {
            this.setState({
              dialog: !this.state.dialog,
              dialogType: '',
              dialogLoading: false,
              dialogItems: [],
            });
          }
        },
      );
    } else if (this.state.dialogType === 'moveToCartAll') {
      await Global.onClickMoveToCartWishlist(
        this.state.dialogType,
        this.state.moveCart,
        '',
      ).then(res => {
        if (res) {
          let tempWishList = [];
          this.state.wishLists.forEach(x => {
            if (this.state.moveCart.findIndex(e => e === x._id) === -1) {
              tempWishList.push(x);
            }
          });
          if (tempWishList && tempWishList.length > 0) {
            this.setState({
              wishLists: tempWishList,
              dialog: !this.state.dialog,
              dialogType: '',
              dialogLoading: false,
            });
          } else {
            this.setState({
              wishLists: [],
              noProduct: true,
              dialog: !this.state.dialog,
              dialogType: '',
              dialogLoading: false,
            });
          }
        } else {
          this.setState({
            dialog: !this.state.dialog,
            dialogType: '',
            dialogLoading: false,
          });
        }
      });
    }
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
            {this.state.dialogType === 'wishlistDeleteAll' ||
            this.state.dialogType === 'moveToCartAll' ? (
              <FlatList
                data={this.state.dialogItems}
                keyExtractor={item => item._id}
                scrollEnabled={true}
                renderItem={({item, index}) => (
                  <View
                    style={{
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                      }}>
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
                          source={{uri: item.img}}
                        />
                      </View>
                      <View style={{marginLeft: 5}}>
                        <Text>
                          <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                            Product:{' '}
                          </Text>{' '}
                          <Text
                            style={{
                              fontSize: 15,
                            }}>
                            {item.name && item.name.length > 20
                              ? item.name.slice(0, 20) + '...'
                              : item.name}
                          </Text>
                        </Text>
                        {item.rating ? (
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
                              {item.rating}
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
                            {item.price}
                          </Text>{' '}
                          <Text
                            style={{
                              color: 'gray',
                              fontSize: 14,
                              textDecorationLine: 'line-through',
                            }}>
                            {'₹'}
                            {item.originalprice}
                          </Text>{' '}
                          {item.offerpercentage !== '0' ? (
                            <Text
                              style={{
                                color: 'green',
                                fontWeight: 'bold',
                                fontSize: 13,
                              }}>
                              {item.offerpercentage + '%'}
                            </Text>
                          ) : null}
                        </Text>
                        {!item.isMove &&
                        this.state.dialogType === 'moveToCartAll' ? (
                          <View>
                            <Text
                              style={{
                                color: 'red',
                                fontWeight: 'bold',
                                fontSize: 15,
                              }}>
                              {'*This product is already in cart*'}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                    <View
                      style={{
                        borderWidth: 1,
                        marginTop: 2,
                        marginBottom: 2,
                      }}
                    />
                  </View>
                )}
              />
            ) : (
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
            )}
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
                      if (
                        this.state.dialogType === 'wishlistDeleteAll' ||
                        this.state.dialogType === 'moveToCartAll'
                      ) {
                        await this.performAction('', '');
                      } else {
                        await this.performAction(
                          this.state.dialogItems._id,
                          this.state.dialogItems.name,
                        );
                      }
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
  onClickCheckbox(value, id) {
    if (id) {
      let tempWish = [];
      this.state.wishLists.forEach(e => {
        if (e._id === id) {
          e.isChecked = value;
        }
        tempWish.push(e);
      });
      if (value) {
        // this.setState({wishLists: tempWish, bottomContainerOpen: true});
        let flag = false;
        for (let i = 0; i < this.state.wishLists.length; i++) {
          if (!this.state.wishLists[i].isChecked) {
            flag = true;
            break;
          }
        }
        console.log(id, value);
        if (flag) {
          this.setState({
            wishLists: tempWish,
            bottomContainerOpen: true,
            selectAll: false,
          });
        } else {
          this.setState({
            wishLists: tempWish,
            bottomContainerOpen: true,
            selectAll: true,
          });
        }
      } else {
        let flag = false;
        for (let i = 0; i < this.state.wishLists.length; i++) {
          if (this.state.wishLists[i].isChecked) {
            flag = true;
            break;
          }
        }
        if (flag) {
          // this.setState({wishLists: tempWish, bottomContainerOpen: true});

          for (let i = 0; i < this.state.wishLists.length; i++) {
            if (!this.state.wishLists[i].isChecked) {
              flag = true;
              break;
            }
          }
          if (flag) {
            this.setState({
              selectAll: false,
              bottomContainerOpen: true,
              wishLists: tempWish,
            });
          } else {
            this.setState({
              selectAll: true,
              bottomContainerOpen: true,
              wishLists: tempWish,
            });
          }
        } else {
          this.setState({wishLists: tempWish, bottomContainerOpen: false});
        }
      }
      console.log(this.state.bottomContainerOpen, this.state.selectAll);
      if (this.state.bottomContainerOpen) {
      }
    } else {
      if (value) {
        let tempWish = [];
        this.state.wishLists.forEach(e => {
          e.isChecked = value;
          tempWish.push(e);
        });
        this.setState({
          wishLists: tempWish,
          bottomContainerOpen: true,
          selectAll: true,
        });
      } else {
        let tempWish = [];
        this.state.wishLists.forEach(e => {
          e.isChecked = value;
          tempWish.push(e);
        });
        this.setState({
          wishLists: tempWish,
          bottomContainerOpen: false,
          selectAll: false,
        });
      }
    }
  }
  _renderProducts = () => {
    return (
      <FlatList
        style={{alignSelf: 'center'}}
        data={this.state.wishLists}
        numColumns={2}
        keyExtractor={item => item._id}
        scrollEnabled={true}
        refreshing={this.state.refresh}
        onRefresh={this.refreshHandler}
        renderItem={({item, index}) => (
          <TouchableWithoutFeedback
            onPress={() => {
              this.props.navigation.navigate('Product', {
                screen: 'productDrawer',
                params: {
                  productId: item._id,
                },
              });
            }}>
            <CardView
              key={index}
              style={styles.cardContainer}
              cardElevation={5}
              cardMaxElevation={2}
              cornerRadius={10}>
              <Image style={styles.imgContainer} source={{uri: item.img}} />
              <TouchableOpacity style={styles.CheckBox}>
                <CheckBox
                  tintColors={{
                    true: Color.primary,
                  }}
                  value={item.isChecked}
                  onValueChange={value => {
                    this.onClickCheckbox(value, item._id);
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.wishList}
                onPress={async () => {
                  if (await Global.isLoggedIn()) {
                    this.toggleDialog(
                      'delete',
                      `Are ${
                        (await AsyncStorage.getItem('name')).split(' ')[0]
                      } want to delete this product ?`,
                      item,
                    );
                  } else {
                    this.toggleDialog(
                      'delete',
                      'Are you want to delete this product ?',
                      item,
                    );
                  }
                }}>
                <Icon name="close" size={25} color={Color.warn} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.moveToCart}
                onPress={async () => {
                  if (await Global.isLoggedIn()) {
                    this.toggleDialog(
                      'move',
                      `Are ${
                        (await AsyncStorage.getItem('name')).split(' ')[0]
                      } want to move this to cart ?`,
                      item,
                    );
                  } else {
                    this.toggleDialog(
                      'move',
                      'Are you want to move this to cart ?',
                      item,
                    );
                  }
                }}>
                <Icon name="cart" size={25} color={Color.primary} />
              </TouchableOpacity>

              <View style={{height: height / 3}}>
                <View style={{flexDirection: 'column', margin: hp(0.5)}}>
                  <Text style={{fontSize: 17}}>
                    {item.name && item.name.length > 18
                      ? item.name.slice(0, 18) + '...'
                      : item.name}
                  </Text>
                  {item.totalrating ? (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Icon color="green" name="star" size={15} />
                      <Text
                        style={{
                          fontSize: 18,
                          marginLeft: 2,
                          fontWeight: 'bold',
                          color: 'green',
                        }}>
                        {item.rating}
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
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
                        fontSize: 16,
                        color: 'gray',
                        textDecorationLine: 'line-through',
                      }}>
                      {'₹'}
                      {item.originalprice}
                    </Text>
                    {item.offerpercentage !== '0' ? (
                      <Text
                        style={{
                          fontSize: 15,
                          color: 'green',
                          fontWeight: 'bold',
                        }}>
                        {' '}
                        {item.offerpercentage + '%'}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            </CardView>
          </TouchableWithoutFeedback>
        )}
      />
    );
  };
  async onClickSelectAll(type) {
    let name = '';
    if (await Global.isLoggedIn()) {
      name = (await AsyncStorage.getItem('name')).split(' ')[0];
    } else {
      name = 'you';
    }
    if (type === 'moveToCartAll') {
      let tempArray = [],
        tempMove = [],
        cartList = [];
      cartList = JSON.parse(await AsyncStorage.getItem('cartList'));
      if (!this.state.selectAll) {
        if (cartList === null) {
          this.state.wishLists.forEach(e => {
            if (e.isChecked) {
              e.isMove = true;
              tempMove.push(e._id);
            } else {
              e.isMove = false;
            }
            tempArray.push(e);
          });
        } else {
          this.state.wishLists.forEach(e => {
            if (cartList.findIndex(x => x === e._id) > -1) {
              e.isMove = false;
            } else {
              e.isMove = true;
              if (e.isChecked) {
                tempMove.push(e._id);
              }
            }
            tempArray.push(e);
          });
        }
        this.setState({moveCart: tempMove});
        this.toggleDialog(type, `Are ${name} want to move all?`, tempArray);
      } else {
        if (cartList === null) {
          this.toggleDialog(
            type,
            `Are ${name} want to move all?`,
            this.state.wishLists,
          );
        } else {
          this.state.wishLists.forEach(e => {
            if (cartList.findIndex(x => x === e._id) > -1) {
              e.isMove = false;
            } else {
              e.isMove = true;
              tempMove.push(e._id);
            }
            tempArray.push(e);
          });
          this.setState({moveCart: tempMove});
          this.toggleDialog(type, `Are ${name} want to move all?`, tempArray);
        }
      }
    } else if (type === 'wishlistDeleteAll') {
      this.toggleDialog(
        type,
        `Are ${name} want to delete all?`,
        this.state.wishLists,
      );
    }
  }
  render() {
    return (
      <View style={styles.mainContainer}>
        {!!this.state.dialog && this.renderDialog()}
        {this.state.noProduct ? (
          <View style={styles.somethingWentWrong}>
            <Image
              style={{width: 200, height: 200}}
              source={require('../../assets/images/wishlist-header.png')}
            />
            <Text style={{fontSize: 25, fontWeight: 'bold'}}>
              Oops,{' '}
              {this.state.name ? this.state.name.split(' ')[0] + "'s" : 'you'}{' '}
              have no wishlist !!!
            </Text>
            <Text style={{fontSize: 20, color: 'gray'}}>
              add your favourite product to wishlist
            </Text>
          </View>
        ) : (
          <SkeletonContent
            containerStyle={{
              flex: 1,
              flexDirection: this.state.isLoading ? 'row' : 'column',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
            isLoading={this.state.isLoading}
            animationDirection="diagonalDownRight"
            layout={[
              {
                key: '1',
                width: 175,
                height: 200,
                margin: hp(1),
                borderRadius: 10,
              },
              {
                key: '2',
                width: 175,
                height: 200,
                margin: hp(1),
                borderRadius: 10,
              },
              {
                key: '3',
                width: 175,
                height: 200,
                margin: hp(1),
                borderRadius: 10,
              },
              {
                key: '4',
                width: 175,
                height: 200,
                margin: hp(1),
                borderRadius: 10,
              },
              {
                key: '5',
                width: 175,
                height: 200,
                margin: hp(1),
                borderRadius: 10,
              },
              {
                key: '6',
                width: 175,
                height: 200,
                margin: hp(1),
                borderRadius: 10,
              },
              {
                key: '7',
                width: 175,
                height: 200,
                margin: hp(1),
                borderRadius: 10,
              },
              {
                key: '8',
                width: 175,
                height: 200,
                margin: hp(1),
                borderRadius: 10,
              },
            ]}>
            {this._renderProducts()}
            {this.state.bottomContainerOpen ? (
              <View style={styles.bottomContainer}>
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
                  <Text style={{fontSize: 20, alignSelf: 'center'}}>
                    Select All
                  </Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    style={styles.selectAll}
                    onPress={() => {
                      this.onClickSelectAll('wishlistDeleteAll');
                    }}>
                    <Icon name="close" size={25} color={Color.warn} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.selectAll}
                    onPress={() => {
                      this.onClickSelectAll('moveToCartAll');
                    }}>
                    <Icon name="cart" size={25} color={Color.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </SkeletonContent>
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
  somethingWentWrong: {
    width: width,
    height: height / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: 180,
    height: 200,
    backgroundColor: 'white',
    margin: hp(1),
  },
  imgContainer: {
    width: 'auto',
    maxWidth: 180,
    height: height / 7,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'black',
  },
  wishList: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    position: 'absolute',
    alignSelf: 'flex-end',
    right: 5,
    top: 5,
  },
  moveToCart: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    position: 'absolute',
    alignSelf: 'flex-end',
    right: 5,
    top: 50,
  },
  CheckBox: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    position: 'absolute',
    alignSelf: 'flex-start',
    left: 5,
    top: 5,
  },
  bottomContainer: {
    width: width / 2,
    height: 100,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: 'white',
    elevation: 20,
    bottom: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  selectAll: {
    width: 40,
    height: 40,
    borderWidth: 1,
    margin: 2,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 10,
  },
});

/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {ToastAndroid} from 'react-native';
import {BehaviorSubject} from 'rxjs';
const subscriber = new BehaviorSubject('');
const address = new BehaviorSubject();
export {subscriber, address};
const Global = {
  apiURL: 'http://192.168.0.152:3000/api/',
  // apiURL: 'http://192.168.64.185:3000/api/',
  isLoggedIn: async () => {
    let user_id = (await AsyncStorage.getItem('_id')) ? true : false;

    if (user_id) {
      console.log('User is Logged in.');
      subscriber.next({
        name: await AsyncStorage.getItem('name'),
        cart: JSON.parse(await AsyncStorage.getItem('cartList'))
          ? JSON.parse(await AsyncStorage.getItem('cartList')).length
          : 0,
        wishList: JSON.parse(await AsyncStorage.getItem('wishList'))
          ? JSON.parse(await AsyncStorage.getItem('wishList')).length
          : 0,
      });
      return true;
    } else {
      subscriber.next({
        cart: JSON.parse(await AsyncStorage.getItem('cartList'))
          ? JSON.parse(await AsyncStorage.getItem('cartList')).length
          : 0,
        wishList: JSON.parse(await AsyncStorage.getItem('wishList'))
          ? JSON.parse(await AsyncStorage.getItem('wishList')).length
          : 0,
      });
      console.log('User is Logged Out.');
      return false;
    }
  },
  toasterMessage: (msg, type = '') => {
    return ToastAndroid.show(
      msg,
      type === 'long' ? ToastAndroid.LONG : ToastAndroid.SHORT,
    );
  },
  checkWishList: async items => {
    let wishListArr = [];
    wishListArr = await AsyncStorage.getItem('wishList');
    if (items && items.length > 0) {
      items.forEach(x => {
        if (
          wishListArr &&
          wishListArr.length > 0 &&
          wishListArr.indexOf(x._id) > -1
        ) {
          x.icon = 'heart';
        } else {
          x.icon = 'heart-o';
        }
      });
    }
    return items;
  },
  checCartList: async id => {
    let cartListArr = [],
      flag = false;
    cartListArr = JSON.parse(await AsyncStorage.getItem('cartList'));
    if (id) {
      if (cartListArr && cartListArr.length > 0) {
        cartListArr.forEach(e => {
          if (e === id) {
            flag = true;
          }
        });
      }
    }
    return flag;
  },
  onClickCartWishList: async (type = '', data, productName = '') => {
    let wishList = [],
      cartList = [];
    let responseStatus = false;
    let api = Global.apiURL;
    if (await Global.isLoggedIn()) {
      console.log('Login Cart or Wishlist');
      let params = {};
      if (type === 'wishlistAdd') {
        api += 'product/save-cart-wishlist';
        wishList = JSON.parse(await AsyncStorage.getItem('wishList'));
        console.log('LINE_58', wishList.indexOf(data));
        if (wishList.indexOf(data) === -1) {
          wishList = [...wishList, data];
          console.log('LINE_61', wishList);
          params = {
            userId: await AsyncStorage.getItem('_id'),
            cart: [],
            wishlist: [data],
          };
        } else {
          Global.toasterMessage(
            `${productName} is already added in ${
              (await AsyncStorage.getItem('name')).split(' ')[0]
            }'s wishlist`,
          );
          return responseStatus;
        }
      } else if (type === 'cartAdd') {
        api += 'product/save-cart-wishlist';
        params = {
          userId: await AsyncStorage.getItem('_id'),
          cart: [data],
          wishlist: [],
        };
      } else if (type === 'wishlistDelete') {
        api += 'product/delete-cart-wishlist';
        wishList = JSON.parse(await AsyncStorage.getItem('wishList'));
        if (wishList.indexOf(data) > -1) {
          params = {
            userId: await AsyncStorage.getItem('_id'),
            cart: [],
            wishlist: [data],
          };
        } else {
          Global.toasterMessage(
            `${productName} is already deleted from ${
              (await AsyncStorage.getItem('name')).split(' ')[0]
            }'s wishlist`,
          );
          return responseStatus;
        }
      } else if (type === 'wishlistDeleteAll') {
        api += 'product/delete-cart-wishlist';
        params = {
          userId: await AsyncStorage.getItem('_id'),
          cart: [],
          wishlist: data,
        };
      } else if (type === 'cartDelete') {
        api += 'product/delete-cart-wishlist';
        cartList = JSON.parse(await AsyncStorage.getItem('cartList'));
        if (cartList.indexOf(data) > -1) {
          params = {
            userId: await AsyncStorage.getItem('_id'),
            cart: [data],
            wishlist: [],
          };
        } else {
          Global.toasterMessage(
            `${productName} is already deleted from ${
              (await AsyncStorage.getItem('name')).split(' ')[0]
            }'s cart`,
          );
          return responseStatus;
        }
      }
      console.log(params);
      await axios
        .post(api, params)
        .then(async response => {
          // console.log(response.data);
          if (response.data && response.data.status && response.data.data) {
            // console.log('LINE_108');
            if (type === 'wishlistAdd') {
              await AsyncStorage.setItem(
                'wishList',
                JSON.stringify(response.data.data.wishlist),
              );
              Global.toasterMessage(
                `${productName} is sucessfully added in ${
                  (await AsyncStorage.getItem('name')).split(' ')[0]
                }'s wishlist`,
              );
              responseStatus = true;
            } else if (type === 'cartAdd') {
              await AsyncStorage.setItem(
                'cartList',
                JSON.stringify(response.data.data.cart),
              );
              Global.toasterMessage(
                `${productName} is sucessfully added in ${
                  (await AsyncStorage.getItem('name')).split(' ')[0]
                }'s cart`,
              );
              responseStatus = true;
            } else if (type === 'wishlistDelete') {
              await AsyncStorage.setItem(
                'wishList',
                JSON.stringify(response.data.data.wishlist),
              );
              Global.toasterMessage(
                `${productName} is sucessfully deleted from ${
                  (await AsyncStorage.getItem('name')).split(' ')[0]
                }'s wishlist`,
              );
              responseStatus = true;
            } else if (type === 'wishlistDeleteAll') {
              await AsyncStorage.setItem(
                'wishList',
                JSON.stringify(response.data.data.wishlist),
              );
              Global.toasterMessage(
                `Items ${
                  data && data.length > 1 ? 'are' : 'is'
                } sucessfully deleted from ${
                  (await AsyncStorage.getItem('name')).split(' ')[0]
                }'s wishlist`,
              );
              responseStatus = true;
            } else if (type === 'cartDelete') {
              await AsyncStorage.setItem(
                'cartList',
                JSON.stringify(response.data.data.cart),
              );
              Global.toasterMessage(
                `${productName} is sucessfully deleted from ${
                  (await AsyncStorage.getItem('name')).split(' ')[0]
                }'s cart`,
              );
              responseStatus = true;
            }
          }
        })
        .catch(err => {
          responseStatus = console.log(err.message);
        });
      return responseStatus;
    } else {
      console.log('Without Login Cart or Wishlist');
      if (type === 'wishlistAdd') {
        wishList = JSON.parse(await AsyncStorage.getItem('wishList'));
        if (wishList !== null && wishList.indexOf(data) === -1) {
          wishList = [...wishList, data];
          await AsyncStorage.setItem('wishList', JSON.stringify(wishList));
          Global.toasterMessage(
            `${productName} is added in your temporary wishlist`,
          );
          responseStatus = true;
        } else if (!wishList) {
          await AsyncStorage.setItem('wishList', JSON.stringify([data]));
          Global.toasterMessage(
            `${productName} is added in your temporary wishlist`,
          );
          responseStatus = true;
        } else {
          Global.toasterMessage(
            `${productName} is already added in your temporary wishlist`,
          );
        }
      } else if (type === 'wishlistDelete') {
        wishList = JSON.parse(await AsyncStorage.getItem('wishList'));
        if (wishList !== null && wishList.indexOf(data) > -1) {
          if (wishList && wishList.length === 1) {
            await AsyncStorage.removeItem('wishList');
          } else {
            let tempWishList = [];
            wishList.forEach(e => {
              if (e !== data) {
                tempWishList.push(e);
              }
            });
            await AsyncStorage.setItem(
              'wishList',
              JSON.stringify(tempWishList),
            );
          }
          Global.toasterMessage(
            `${productName} is deleted from your temporary wishlist`,
          );
          responseStatus = true;
        } else if (wishList === null) {
          Global.toasterMessage('Your wishlist is empty');
        } else {
          Global.toasterMessage(
            `${productName} is already deleted from your temporary wishlist`,
          );
        }
      } else if (type === 'wishlistDeleteAll') {
        wishList = JSON.parse(await AsyncStorage.getItem('wishList'));
        if (wishList === null) {
          Global.toasterMessage('Your wishlist is empty');
        } else {
          let tempArray = [];
          wishList.forEach(e => {
            if (data.indexOf(e) === -1) {
              tempArray.push(e);
            }
          });
          await AsyncStorage.setItem('wishList', JSON.stringify(tempArray));
          Global.toasterMessage(
            `Items ${
              data && data.length > 1 ? 'are' : 'is'
            } sucessfully deleted from ${
              (await AsyncStorage.getItem('name')).split(' ')[0]
            }'s wishlist`,
          );
          responseStatus = true;
        }
      } else if (type === 'cartAdd') {
        cartList = JSON.parse(await AsyncStorage.getItem('cartList'));
        if (cartList !== null && cartList.indexOf(data) === -1) {
          cartList = [...cartList, data];
          await AsyncStorage.setItem('cartList', JSON.stringify(cartList));
          Global.toasterMessage(
            `${productName} is added in your temporary cart`,
          );
          responseStatus = true;
        } else if (!cartList) {
          await AsyncStorage.setItem('cartList', JSON.stringify([data]));
          Global.toasterMessage(
            `${productName} is added in your temporary cart`,
          );
          responseStatus = true;
        } else {
          Global.toasterMessage(
            `${productName} is already added in your temporary cart`,
          );
        }
      }
    }
    return responseStatus;
  },
  onClickMoveToCartWishlist: async (type, id, name) => {
    let params = {},
      listArray = [],
      responseStatus = false;
    if (type === 'moveToCart') {
      listArray = JSON.parse(await AsyncStorage.getItem('cartList'))
        ? JSON.parse(await AsyncStorage.getItem('cartList'))
        : [];
      if (await Global.isLoggedIn()) {
        if (listArray.indexOf(id) > -1) {
          Global.toasterMessage(
            `${name} is already present in ${
              (await AsyncStorage.getItem('name')).split(' ')[0]
            }'s cart`,
          );
          return responseStatus;
        } else {
          params = {
            userId: await AsyncStorage.getItem('_id'),
            cart: [],
            wishlist: [id],
          };
        }
      } else {
        // When Not Login
        if (listArray && listArray.length > 0 && listArray.indexOf(id) > -1) {
          Global.toasterMessage(`${name} is already present in your cart`);
          return responseStatus;
        } else {
          let wishArray = JSON.parse(await AsyncStorage.getItem('wishList'));
          listArray = [...listArray, id];
          let tempWish = [];
          wishArray.forEach(e => {
            if (e !== id) {
              tempWish.push(e);
            }
          });
          await AsyncStorage.setItem('cartList', JSON.stringify(listArray));
          await AsyncStorage.setItem('wishList', JSON.stringify(tempWish));
          Global.toasterMessage(`${name} is moved to your cart`);
          responseStatus = true;
        }
      }
    } else if (type === 'moveToWishlist') {
      listArray = JSON.parse(await AsyncStorage.getItem('wishList'));
      if (await Global.isLoggedIn()) {
        if (listArray.indexOf(id) > -1) {
          Global.toasterMessage(
            `${name} is already present in ${
              (await AsyncStorage.getItem('name')).split(' ')[0]
            }'s wishlist`,
          );
          return responseStatus;
        } else {
          params = {
            userId: await AsyncStorage.getItem('_id'),
            cart: [id],
            wishlist: [],
          };
        }
      } else {
        // When Not Login
        if (listArray && listArray.length > 0 && listArray.indexOf(id) > -1) {
          Global.toasterMessage(`${name} is already present in your wishlist`);
          return responseStatus;
        } else {
          let cartArray = JSON.parse(await AsyncStorage.getItem('cartList'));
          listArray = [...listArray, id];
          let tempcart = [];
          cartArray.forEach(e => {
            if (e !== id) {
              tempcart.push(e);
            }
          });
          await AsyncStorage.setItem('wishList', JSON.stringify(listArray));
          await AsyncStorage.setItem('cartList', JSON.stringify(tempcart));
          Global.toasterMessage(`${name} is moved to your wishlist`);
          responseStatus = true;
        }
      }
    } else if (type === 'moveToCartAll') {
      console.log(id);
      if (id && id.length > 0) {
        listArray = JSON.parse(await AsyncStorage.getItem('cartList'))
          ? JSON.parse(await AsyncStorage.getItem('cartList'))
          : [];
        if (await Global.isLoggedIn()) {
          params = {
            userId: await AsyncStorage.getItem('_id'),
            cart: [],
            wishlist: id,
          };
        } else {
          // When Not Login
          let wishArray = JSON.parse(await AsyncStorage.getItem('wishList'));
          listArray = [...listArray, id];
          let tempWish = [];
          wishArray.forEach(e => {
            if (e !== id) {
              tempWish.push(e);
            }
          });
          await AsyncStorage.setItem('cartList', JSON.stringify(listArray));
          await AsyncStorage.setItem('wishList', JSON.stringify(tempWish));
          Global.toasterMessage(`${name} is moved to your cart`);
          responseStatus = true;
        }
      } else {
        return responseStatus;
      }
    }
    if (await Global.isLoggedIn()) {
      await axios
        .post(Global.apiURL + 'product/move-cart-wishlist-viceversa', params)
        .then(async response => {
          console.log(response.data);
          if (response.data && response.data.status) {
            responseStatus = true;
            if (type === 'moveToCart') {
              Global.toasterMessage(
                `${name} is moved to ${
                  (await AsyncStorage.getItem('name')).split(' ')[0]
                }'s cart`,
              );
              let wishArray = JSON.parse(
                await AsyncStorage.getItem('wishList'),
              );
              listArray = [...listArray, id];
              let tempWish = [];
              wishArray.forEach(e => {
                if (e !== id) {
                  tempWish.push(e);
                }
              });
              await AsyncStorage.setItem('cartList', JSON.stringify(listArray));
              await AsyncStorage.setItem('wishList', JSON.stringify(tempWish));
            } else if (type === 'moveToWishlist') {
              Global.toasterMessage(
                `${name} is moved to ${
                  (await AsyncStorage.getItem('name')).split(' ')[0]
                }'s wishlist`,
              );
              let wishArray = JSON.parse(
                await AsyncStorage.getItem('cartList'),
              );
              listArray = [...listArray, id];
              let tempWish = [];
              wishArray.forEach(e => {
                if (e !== id) {
                  tempWish.push(e);
                }
              });
              await AsyncStorage.setItem('wishList', JSON.stringify(listArray));
              await AsyncStorage.setItem('cartList', JSON.stringify(tempWish));
            } else if (type === 'moveToCartAll') {
              Global.toasterMessage(
                `${
                  id && id.length > 1 ? 'Products are' : 'Product is'
                } moved to ${
                  (await AsyncStorage.getItem('name')).split(' ')[0]
                }'s wishlist`,
              );
              let wishArray = JSON.parse(
                await AsyncStorage.getItem('wishList'),
              );
              id.forEach(e => {
                listArray.push(e);
              });
              let tempWish = [];
              wishArray.forEach(e => {
                if (id.findIndex(x => x === e) === -1) {
                  tempWish.push(e);
                }
              });
              await AsyncStorage.setItem('cartList', JSON.stringify(listArray));
              await AsyncStorage.setItem('wishList', JSON.stringify(tempWish));
            }
          }
        })
        .catch(err => {
          console.log(err.response.data.message);
        });
    }
    return responseStatus;
  },
};
export default Global;

/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';
import {StyleSheet, Text, Dimensions, View} from 'react-native';
import DeviceInfo from 'react-native-device-info';

import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {StackActions} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Color from '../../services/color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Global, {subscriber} from '../../services/global';

//const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const {width, height} = Dimensions.get('window');
const appVersion = DeviceInfo.getVersion();
let d = new Date();
let year = d.getFullYear();

const DrawerContainer = props => {
  let fullName = '',
    orderTotal = '',
    wishListTotal = '',
    isLoggedIn = false;
  const sideMenuList = [
    {
      id: 1,
      label: 'Home',
      iconName: 'home-outline',
      route: 'homeStack',
    },
    {
      id: 2,
      label: 'My Profile',
      iconName: 'account-outline',
      route: 'Profile',
    },
    {
      id: 3,
      label: 'My Orders',
      iconName: 'notebook-outline',
      route: 'Orders',
    },
    {
      id: 4,
      label: 'My Wishlist',
      iconName: 'account-heart-outline',
      route: 'Wishlist',
    },
    {
      id: 5,
      label: 'Search',
      iconName: 'shopping-search',
      route: 'Search',
    },
  ];
  let sideMenu = [];
  Global.isLoggedIn();
  subscriber.subscribe(async data => {
    if (data && data.name && data.name !== ' ') {
      fullName = data.name;
      isLoggedIn = true;
    } else {
      isLoggedIn = false;
      fullName = '🧒 User 👩';
    }
    if (data && data.cart && data.cart > 0) {
      orderTotal = data.cart;
    } else {
      orderTotal = 'No';
    }
    if (data && data.wishList && data.wishList > 0) {
      wishListTotal = data.wishList;
    } else {
      wishListTotal = 'No';
    }
  });
  // Drawer List
  for (let i = 0; i < sideMenuList.length; i++) {
    sideMenu.push(
      <DrawerItem
        key={i}
        focused={true}
        icon={({color, size}) => (
          <Icon name={sideMenuList[i].iconName} color={'#fff'} size={25} />
        )}
        labelStyle={{color: '#fff', fontSize: 16}}
        label={sideMenuList[i].label}
        onPress={async () => {
          if (isLoggedIn) {
            props.navigation.navigate(sideMenuList[i].route);
            props.navigation.closeDrawer();
          } else if (!isLoggedIn && sideMenuList[i].label === 'My Wishlist') {
            props.navigation.navigate(sideMenuList[i].route);
            props.navigation.closeDrawer();
          } else {
            props.navigation.dispatch(StackActions.replace('Auth'));
            props.navigation.closeDrawer();
          }
        }}
      />,
    );
  }
  return (
    <View style={{flex: 1, backgroundColor: Color.primary}}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <View style={styles.userInfoSection}>
            <View style={{flexDirection: 'row', marginTop: 15}}>
              <Text style={styles.drawerHeaderText}>Hii, </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.title}>{fullName}</Text>
            </View>
            <View style={styles.row}>
              <View style={styles.section}>
                <Text style={{color: 'white'}}>You have </Text>
                <Text
                  style={[
                    styles.paragraph,
                    styles.caption,
                    {color: 'lightgreen'},
                  ]}>
                  {orderTotal}
                </Text>
                <Text style={[styles.caption, {color: 'white'}]}>Carts</Text>

                <Text style={{color: 'white'}}>{' & '}</Text>
                <Text
                  style={[styles.paragraph, styles.caption, {color: 'orange'}]}>
                  {wishListTotal}
                </Text>
                <Text style={[styles.caption, {color: 'white'}]}>Wishlist</Text>
              </View>
            </View>
          </View>

          <View style={styles.drawerSection}>
            {sideMenu}

            {isLoggedIn ? (
              <DrawerItem
                focused={true}
                icon={({color, size}) => (
                  <Icon name="exit-to-app" color={'#fff'} size={25} />
                )}
                labelStyle={{color: '#fff', fontSize: 16}}
                label="Sign Out"
                onPress={async () => {
                  subscriber.next({name: '', order: 0, wishList: 0});
                  await AsyncStorage.clear();
                  props.navigation.dispatch(StackActions.replace('Home'));
                }}
              />
            ) : (
              <DrawerItem
                focused={true}
                icon={({color, size}) => (
                  <Icon name="login" color={'#fff'} size={25} />
                )}
                labelStyle={{color: '#fff', fontSize: 16}}
                label="Sign In"
                onPress={async () => {
                  subscriber.next({name: '', order: 0, wishList: 0});
                  await AsyncStorage.clear();
                  props.navigation.dispatch(StackActions.replace('Auth'));
                }}
              />
            )}
          </View>
        </View>
      </DrawerContentScrollView>
      <View style={styles.bottomDrawerSection}>
        <Text style={styles.drawerFooterText}>Version {appVersion}</Text>
        <Text style={styles.drawerFooterText}>
          @ {year} DailyKart. All Rights Reserved
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  // sidebar menu
  drawerHeaderText: {
    textAlign: 'left',
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 25,
    color: 'white',
  },
  caption: {
    fontSize: 15,
    lineHeight: 18,
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
    color: '#fff',
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
  },
  drawerFooterText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
    marginTop: 5,
    paddingBottom: 10,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

export default DrawerContainer;

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
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {StackActions} from '@react-navigation/native';
import Global, {subscriber} from '../../services/global';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Color from '../../services/color';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class Account extends Component {
  constructor() {
    super();
    this.state = {
      name: '',
      email: '',
      ph: '',
      isLogedin: false,
      menuList: [
        {
          _id: 0,
          label: 'My Order',
          routerLink: 'Orders',
          iconSize: 30,
          iconName: 'angle-right',
        },
        {
          _id: 1,
          label: 'My Addresses',
          routerLink: 'Address',
          iconSize: 30,
          iconName: 'angle-right',
        },
        {
          _id: 2,
          label: 'My Profile',
          routerLink: 'Profile',
          iconSize: 30,
          iconName: 'angle-right',
        },
        {
          _id: 3,
          label: 'My Wishlist',
          routerLink: 'Wishlist',
          iconSize: 30,
          iconName: 'angle-right',
        },
        {
          _id: 4,
          label: 'My Cart',
          routerLink: 'Cart',
          iconSize: 30,
          iconName: 'angle-right',
        },
        {
          _id: 5,
          label: 'Category',
          routerLink: 'Category',
          iconSize: 30,
          iconName: 'angle-right',
        },
      ],
    };
  }
  componentDidMount() {
    this.getDetails();
    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      console.log('Account Listener');
      this.getDetails();
    });
  }
  async getDetails() {
    this.setState({
      name: (await Global.isLoggedIn())
        ? await AsyncStorage.getItem('name')
        : 'User',
      isLogedin: await Global.isLoggedIn(),
      email: (await Global.isLoggedIn())
        ? await AsyncStorage.getItem('email')
        : '',
      ph: (await Global.isLoggedIn()) ? await AsyncStorage.getItem('ph') : '',
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  _renderMenuList = () => {
    return (
      <FlatList
        data={this.state.menuList}
        keyExtractor={item => item._id}
        scrollEnabled={true}
        renderItem={({item, index}) => (
          <View>
            {this.state.isLogedin ? (
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate(item.routerLink);
                }}>
                <View style={styles.navigationButton}>
                  <Text style={styles.navigationButtonText}>{item.label}</Text>
                  <FontAwesome
                    style={styles.navigationButtonIcon}
                    size={item.iconSize}
                    name={item.iconName}
                  />
                </View>
              </TouchableOpacity>
            ) : item.label === 'Category' ||
              item.label === 'My Wishlist' ||
              item.label === 'My Cart' ? (
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate(item.routerLink);
                }}>
                <View style={styles.navigationButton}>
                  <Text style={styles.navigationButtonText}>{item.label}</Text>
                  <FontAwesome
                    style={styles.navigationButtonIcon}
                    size={item.iconSize}
                    name={item.iconName}
                  />
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={async () => {
              if (!this.state.isLogedin) {
                this.props.navigation.navigate('Auth');
              } else {
                subscriber.next({name: '', order: 0, wishList: 0});
                await AsyncStorage.clear();
                this.props.navigation.dispatch(StackActions.replace('Home'));
              }
            }}>
            <Text style={styles.buttonText}>
              {!this.state.isLogedin ? 'Sign in' : 'Sign out'}
            </Text>
          </TouchableOpacity>
        )}
      />
    );
  };
  render() {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.imgContainer}>
          <Image
            style={styles.imageView}
            source={require('../../assets/images/avater.jpg')}
          />
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}>
            <Text style={{fontSize: 25, fontWeight: 'bold', color: 'white'}}>
              Hii,{' '}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'normal',
                  flex: 1,
                  flexWrap: 'wrap',
                }}>
                {this.state.name && this.state.name.length > 30
                  ? this.state.name.slice(0, 30) + '...'
                  : this.state.name}
              </Text>
            </Text>
            {this.state.email && this.state.ph ? (
              <View>
                <Text
                  style={{fontSize: 16, fontWeight: 'bold', color: 'white'}}>
                  Email:{' '}
                  <Text style={{fontSize: 14}}>
                    {this.state.email && this.state.email.length > 30
                      ? this.state.email.slice(0, 30) + '...'
                      : this.state.email}
                  </Text>
                </Text>
                <Text
                  style={{fontSize: 16, fontWeight: 'bold', color: 'white'}}>
                  Ph:{' '}
                  <Text style={{fontSize: 14}}>{'+91-' + this.state.ph}</Text>
                </Text>
              </View>
            ) : (
              <Text style={{fontSize: 14, color: 'white'}}>
                Please Signin / Signup to continue shopping
              </Text>
            )}
          </View>
        </View>
        {this._renderMenuList()}
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
  imgContainer: {
    backgroundColor: Color.primary,
    height: hp(15),
    alignItems: 'center',
    borderBottomWidth: 0.75,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  imageView: {width: 100, height: 100, borderRadius: 100, margin: 5},
  navigationButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderBottomWidth: 0.5,
  },
  navigationButtonText: {fontSize: 20, fontWeight: 'bold', marginLeft: 10},
  navigationButtonIcon: {marginRight: 10},
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
  },
  bottomButton: {
    height: 40,
    margin: 10,
    marginRight: 20,
    borderRadius: 5,
    backgroundColor: Color.primary,
  },
});

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
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {StackActions} from '@react-navigation/native';
import Global from '../../services/global';
import Color from '../../services/color';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RadioForm from 'react-native-simple-radio-button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default class Profile extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      name: '',
      ph: '',
      email: '',
      gender: 'M',
      radio_props: [
        {label: 'Male', value: 'M'},
        {label: 'Female', value: 'F'},
        {label: 'Other', value: 'O'},
      ],
      cartItems: 0,
      wishItems: 0,
    };
  }
  componentDidMount() {
    // Commend in Production
    this.getUserDetails();
    // End Commend
    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      this.getUserDetails();
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  async getUserDetails() {
    if (await Global.isLoggedIn()) {
      await axios
        .get(
          Global.apiURL +
            `user/user-by-id/${await AsyncStorage.getItem('_id')}`,
        )
        .then(res => {
          if (res.data && res.data.status) {
            if (res.data.data) {
              this.setState({
                name:
                  res.data.data.fName +
                  (res.data.data.mName
                    ? ' ' + res.data.data.mName + ' '
                    : ' ') +
                  res.data.data.lName,
                ph: res.data.data.ph,
                email: res.data.data.email,
                gender: res.data.data.gender,
                cartItems: res.data.data.cartLength,
                wishItems: res.data.data.wishLength,
              });
            }
          }
        })
        .catch(err => {
          console.log(
            err &&
              err.response &&
              err.response.data &&
              err.response.data.message
              ? err.response.data.message
              : err.message,
          );
          Global.toasterMessage(
            err &&
              err.response &&
              err.response.data &&
              err.response.data.message
              ? err.response.data.message
              : err.message,
          );
        });
    }
  }
  render() {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.imgContainer}>
          <Image
            style={styles.imageView}
            source={require('../../assets/images/avater.jpg')}
          />
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="circle-edit-outline"
              color="white"
              size={30}
            />
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{flexDirection: 'column', margin: 5}}>
            <View style={styles.inputRow}>
              <Text style={styles.inputText}>Name:</Text>
              <TextInput
                style={styles.input}
                value={this.state.name}
                placeholder="Enter Your Name"
                placeholderTextColor="grey"
                onChangeText={input => {
                  this.setState({name: input});
                }}
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputText}>Email:</Text>
              <TextInput
                style={styles.input}
                value={this.state.email}
                placeholder="Enter Your Email"
                placeholderTextColor="grey"
                onChangeText={input => {
                  this.setState({email: input});
                }}
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputText}>Ph:</Text>
              <TextInput
                style={styles.input}
                value={this.state.ph}
                placeholder="Enter Your Phone Number"
                placeholderTextColor="grey"
                onChangeText={input => {
                  this.setState({ph: input});
                }}
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputText}>Gender:</Text>
              <RadioForm
                formHorizontal={true}
                radio_props={this.state.radio_props}
                animation={true}
                initial={this.state.gender}
                onPress={value => {
                  this.setState({gender: value});
                }}
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputText}>Cart:</Text>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                {this.state.cartItems > 0
                  ? this.state.cartItems + ' items in your cart.'
                  : 'You have no items in your cart.'}
              </Text>
              {this.state.cartItems > 0 ? (
                <TouchableOpacity style={styles.button} onPress={() => {}}>
                  <Text style={styles.buttonText}>Go to Cart</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputText}>Wishlist:</Text>
              <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 2}}>
                {this.state.wishItems > 0
                  ? this.state.wishItems + ' items in your wishlist.'
                  : 'You have no items in your wishlist.'}
              </Text>
              {this.state.wishItems > 0 ? (
                <TouchableOpacity
                  style={[styles.button, {width: 120}]}
                  onPress={() => {}}>
                  <Text style={[styles.buttonText, {fontSize: 16}]}>
                    Go to Wishlist
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </ScrollView>
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
    height: hp(20),
    alignItems: 'center',
    borderBottomWidth: 0.75,
  },
  iconContainer: {
    position: 'relative',
    left: 40,
    bottom: 30,
    backgroundColor: 'black',
    borderRadius: 100,
  },
  imageView: {width: 150, height: 150, borderRadius: 100},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    width: wp(80),
    height: 40,
    color: 'black',
    backgroundColor: 'white',
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 5,
    margin: hp(1),
  },
  inputText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    width: 100,
    height: 40,
    margin: 10,
    marginRight: 20,
    borderRadius: 5,
    backgroundColor: Color.warn,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
  },
});

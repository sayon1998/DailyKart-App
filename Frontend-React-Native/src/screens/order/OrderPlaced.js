/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {View, Image, StyleSheet, Text} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {StackActions} from '@react-navigation/native';
import Global from '../../services/global';
import Color from '../../services/color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TouchableOpacity} from 'react-native-gesture-handler';

export default class OrderPlaced extends Component {
  constructor(props) {
    super();
    this.state = {
      name: '',
      orderDetails: [],
    };
  }
  componentDidMount() {
    this.getDetails();
  }
  async getDetails() {
    this.setState({
      name: await AsyncStorage.getItem('name'),
      orderDetails: this.props.route.params.orderDetails,
    });
  }
  render() {
    return (
      <View style={styles.mainContainer}>
        <View style={{flexDirection: 'column'}}>
          <View style={{backgroundColor: Color.primary}}>
            <Image
              style={{height: 100, width: 100, alignSelf: 'center'}}
              resizeMode="contain"
              source={require('../../assets/images/order-complete.gif')}
            />
            <Text
              style={{
                fontSize: 25,
                textAlign: 'center',
                color: 'white',
                alignSelf: 'center',
                position: 'relative',
                bottom: 20,
              }}>
              Order placed
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              height: hp(30),
            }}>
            <Image
              style={{height: 200, width: 200}}
              resizeMode="contain"
              source={require('../../assets/images/order-confirmation.jpg')}
            />
          </View>
          <Text style={{textAlign: 'center', fontSize: 18}}>
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>
              Hi {this.state.name.split(' ')[0]}
            </Text>
            , Your order has been placed on{' '}
            <Text style={{fontWeight: 'bold'}}>
              {this.state.orderDetails.orderTime}
            </Text>{' '}
            and will be delivered on or before{' '}
            <Text style={{fontWeight: 'bold', color: 'green'}}>
              {this.state.orderDetails.deliveryTime}
            </Text>
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>View order details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: Color.warn}]}
            onPress={() => {
              this.props.navigation.dispatch(StackActions.replace('Home'));
            }}>
            <Text style={styles.buttonText}>Continue to Shopping</Text>
          </TouchableOpacity>
        </View>
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
  button: {
    // width: 100,
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
});

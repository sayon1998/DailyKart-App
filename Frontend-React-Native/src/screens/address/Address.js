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

export default class Address extends Component {
  constructor(props) {
    super();
    this.state = {
      phone: '',
      isEditable: false,
    };
  }
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      console.log('Address Listener');
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  render() {
    return (
      <View style={styles.mainContainer}>
        <Text>Address</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255,.8)',
  },
});

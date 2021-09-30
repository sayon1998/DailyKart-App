/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import React, {Component, useRef, useState} from 'react';
import {
  View,
  Image,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {StackActions} from '@react-navigation/native';
import Global from '../../services/global';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CardView from 'react-native-cardview';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Color from '../../services/color';
import * as Progress from 'react-native-progress';

export default class Search extends Component {
  textInputRef;
  constructor(props) {
    super();
    this.state = {
      searchValue: '',
      searchResult: [],
      isLoading: false,
    };
  }

  componentDidMount() {
    this.getPreviousResult();
    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      console.log('Search Listener');
      this.getPreviousResult();
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  async getPreviousResult() {
    if (
      this.props.route &&
      this.props.route.params &&
      this.props.route.params.searchValue
    ) {
      this.setState({searchValue: this.props.route.params.searchValue});
    }
    this.nameInput.focus();
    if (await Global.isLoggedIn()) {
      this.setState({isLoading: true});
      await axios
        .get(
          Global.apiURL +
            'user/user-by-id/' +
            (await AsyncStorage.getItem('_id')),
        )
        .then(res => {
          if (res.data && res.data.status) {
            this.setState({
              searchResult: res.data.data.recentlySearchDetails,
              isLoading: false,
            });
          }
        })
        .catch(err => {
          console.log(err.response.data.message);
          this.setState({isLoading: false});
        });
    }
  }
  _renderPreviousResult() {
    return (
      <FlatList
        data={this.state.searchResult}
        ListHeaderComponent={() => (
          <View style={{borderBottomWidth: 0.75}}>
            <Text style={{fontSize: 18, fontWeight: 'bold', margin: 5}}>
              Your previous search keywords
            </Text>
          </View>
        )}
        keyExtractor={item => item}
        renderItem={({item, id}) => (
          <TouchableOpacity
            onPress={() => {
              this.onSubmitSearch(item);
              this.setState({searchValue: item});
            }}>
            <View
              style={{
                flexDirection: 'row',
                borderBottomWidth: 0.5,
                height: 40,
              }}>
              <Icon
                style={{alignSelf: 'center'}}
                name="reload-sharp"
                size={20}
              />
              <View style={{width: wp(85), marginLeft: 5, alignSelf: 'center'}}>
                <Text style={{fontSize: 20}}>{item}</Text>
              </View>

              <MaterialCommunityIcons
                style={{alignSelf: 'center'}}
                name="arrow-top-right"
                size={25}
              />
            </View>
          </TouchableOpacity>
        )}
      />
    );
  }
  async onSubmitSearch(value) {
    this.setState({searchValue: value, isLoading: true});
    let params = {
      searchKey: value,
      category: '',
      desc: '',
      prevIndex: '0',
      limit: '10',
      sortType: '',
    };
    console.log(params);
    await axios
      .post(Global.apiURL + 'product/search', params)
      .then(res => {
        if (res.data && res.data.status) {
          // console.log(JSON.stringify(res.data.data));
          if (
            res.data.data &&
            res.data.data.Data &&
            res.data.data.Data.length > 0
          ) {
            Global.lastView('search', this.state.searchValue);
            this.setState({isLoading: false});
            this.props.navigation.navigate('SearchDetails', {
              searchValue: value,
              searchResult: res.data.data.Data,
              prevIndex: res.data.data.prevIndex,
              limit: res.data.data.limit,
            });
          } else {
            Global.lastView('search', this.state.searchValue);
            this.setState({isLoading: false});
            this.props.navigation.navigate('SearchDetails', {
              searchValue: value,
              searchResult: res.data.data.Data,
              prevIndex: res.data.data.prevIndex,
              limit: res.data.data.limit,
              message: res.data.message,
            });
          }
        } else {
          this.setState({isLoading: false});
        }
      })
      .catch(err => {
        this.setState({isLoading: false});
        console.log(err.response.data.message);
      });
  }
  render() {
    return (
      <View style={styles.mainContainer}>
        <CardView
          style={styles.cardContainer}
          cardElevation={5}
          cardMaxElevation={2}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}>
            <Icon
              style={{marginLeft: 5}}
              color="gray"
              name="arrow-back"
              size={20}
              onPress={() => {
                this.props.navigation.navigate('Home', {screen: 'homeDrawer'});
              }}
            />
            <Icon
              style={{marginLeft: 5}}
              color="gray"
              name="search"
              size={20}
            />
            <TextInput
              style={styles.input}
              ref={input => {
                this.nameInput = input;
              }}
              placeholder="Search for Product, Category and More"
              value={this.state.searchValue}
              placeholderTextColor="grey"
              //   editable={this.state.editable}
              onChangeText={input => {
                this.setState({searchValue: input});
              }}
              onSubmitEditing={() => {
                this.onSubmitSearch(this.state.searchValue);
              }}
            />
            <TouchableOpacity
              onPress={() => {
                this.setState({searchValue: ''});
              }}>
              <Icon color="gray" name="close-outline" size={25} />
            </TouchableOpacity>
          </View>
        </CardView>
        {this.state.isLoading ? (
          <Progress.Bar
            progress={0.5}
            width={wp(100)}
            borderRadius={0}
            animated={true}
            color={Color.primary}
            borderColor="white"
            indeterminate={true}
          />
        ) : (
          this._renderPreviousResult()
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
  cardContainer: {
    width: wp(100),
    height: 50,
    backgroundColor: 'white',
  },
  input: {
    width: wp(80),
    color: 'black',
    backgroundColor: 'white',
    borderColor: 'grey',
  },
});

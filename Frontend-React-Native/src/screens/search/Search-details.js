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
  FlatList,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {StackActions} from '@react-navigation/native';
import Global from '../../services/global';
import CardView from 'react-native-cardview';
import Icon from 'react-native-vector-icons/Ionicons';
import {Picker} from '@react-native-community/picker';
import Color from '../../services/color';
import axios from 'axios';

export default class SearchDetails extends Component {
  constructor(props) {
    super();
    this.state = {
      searchValue: '',
      searchResults: [],
      isLoading: false,
      prevIndex: 0,
      sortValue: 'f',
      limit: 0,
      message: '',
      filterArray: [
        {label: 'Filter', value: 'f'},
        {label: 'Newest Arrival', value: '-date'},
        {label: 'User Rating', value: 'rating'},
        {label: 'Price from Low to High', value: 'price'},
        {label: 'Price from High to Low', value: '-price'},
      ],
      isEndReached: false,
      isInfiniteScroll: false,
    };
  }
  componentDidMount() {
    this.getSearchDetails();
    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      console.log('Search Details Listener');
      this.getSearchDetails();
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  getSearchDetails() {
    this.setState({
      searchValue: this.props.route.params.searchValue,
      searchResults: this.props.route.params.searchResult,
      prevIndex: this.props.route.params.prevIndex,
      limit: this.props.route.params.limit,
      message: this.props.route.params.message,
    });
  }
  async makeProductSearch() {
    let params = {
      searchKey: this.state.searchValue,
      category: '',
      desc: '',
      prevIndex: String(this.state.prevIndex),
      limit: '10',
      sortType:
        this.state.sortValue && this.state.sortValue === 'f'
          ? ''
          : this.state.sortValue,
    };
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
            this.setState({
              isInfiniteScroll: false,
              searchResults: [...this.state.searchResults, res.data.data.Data],
              prevIndex: Number(res.data.data.prevIndex),
            });
          } else {
            this.setState({isInfiniteScroll: false, isEndReached: true});
          }
        } else {
          this.setState({isInfiniteScroll: false});
        }
      })
      .catch(err => {
        this.setState({isInfiniteScroll: false});
        console.log(err.response.data.message);
      });
  }
  handleLoadMore = () => {
    console.log('handleLoadMore');
    if (!this.state.isEndReached) {
      this.setState(
        {
          prevIndex: this.state.prevIndex + this.state.limit,
          isInfiniteScroll: true,
        },
        () => {
          this.makeProductSearch();
        },
      );
    }
  };
  _renderProductDetails() {
    return (
      <FlatList
        data={this.state.searchResults}
        keyExtractor={item => item._id}
        scrollEnabled={true}
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
              style={[
                {
                  backgroundColor: 'white',
                  marginBottom: 5,
                  marginTop: index === 0 ? 5 : 0,
                },
              ]}
              cardElevation={5}
              cardMaxElevation={2}>
              <View style={{flexDirection: 'row', margin: 5}}>
                <View
                  style={{
                    width: 85,
                    height: 85,
                    borderWidth: 1,
                    alignItems: 'center',
                    marginLeft: 5,
                  }}>
                  <Image
                    style={{width: 80, height: 80}}
                    source={{uri: item.img}}
                  />
                </View>
                <View style={{flexDirection: 'column', marginLeft: 5}}>
                  <Text style={{fontSize: 16}}>
                    {item.name && item.name.length > 30
                      ? item.name.slice(0, 30) + '...'
                      : item.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                    }}>
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
                    }}>
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
                    {Number(item.offerpercentage) !== 0 ? (
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
                  {item.deliverycharge ? (
                    <Text style={{fontWeight: 'bold'}}>
                      <Text style={{color: 'red'}}>
                        {'₹'}
                        {item.deliverycharge}
                      </Text>{' '}
                      delivery charge is applicable.
                    </Text>
                  ) : null}
                  {item.quantity <= 10 ? (
                    <Text style={{color: 'red', fontWeight: 'bold'}}>
                      Only {item.quantity} Item is left.
                    </Text>
                  ) : (
                    <Text style={{color: 'green', fontWeight: 'bold'}}>
                      Stock is full.
                    </Text>
                  )}
                </View>
              </View>
            </CardView>
          </TouchableWithoutFeedback>
        )}
        ListFooterComponent={() =>
          this.state.isInfiniteScroll ? (
            <ActivityIndicator size="large" color={Color.primary} />
          ) : null
        }
        onEndReached={this.handleLoadMore}
        onEndReachedThreshold={0}
      />
    );
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
                this.props.navigation.push('Search', {
                  screen: 'searchDrawer',
                  params: {
                    searchValue: this.state.searchValue,
                  },
                });
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="Search for Product, Category and More"
              value={this.state.searchValue}
              placeholderTextColor="grey"
              onChangeText={input => {
                this.setState({searchValue: input});
              }}
              onPressIn={() => {
                this.props.navigation.push('Search', {
                  screen: 'searchDrawer',
                  params: {
                    searchValue: this.state.searchValue,
                  },
                });
              }}
            />
          </View>
        </CardView>
        <CardView
          style={styles.cardContainerResult}
          cardElevation={5}
          cardMaxElevation={2}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 5,
            }}>
            <View style={{flexDirection: 'column'}}>
              <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 5}}>
                Search Results:
              </Text>
              <Text style={{fontSize: 12, color: 'gray', marginLeft: 5}}>
                Showing{' '}
                {this.state.searchResults && this.state.searchResults.length > 0
                  ? this.state.searchResults.length
                  : 0}{' '}
                matching products.
              </Text>
            </View>
            <View
              style={{
                borderWidth: 1,
                borderRadius: 5,
                width: wp(30),
                marginRight: 15,
                marginTop: 5,
              }}>
              <Picker
                selectedValue={this.state.sortValue}
                style={{height: 30, width: wp(30)}}
                onValueChange={(itemValue, itemIndex) => {
                  console.log(itemValue);
                  this.setState({sortValue: itemValue});
                }}>
                {this.state.filterArray.map((myValue, myIndex) => {
                  return (
                    <Picker.Item
                      key={myIndex}
                      label={myValue.label}
                      value={myValue.value}
                    />
                  );
                })}
              </Picker>
            </View>
          </View>
        </CardView>
        {this._renderProductDetails()}
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
  cardContainerResult: {
    width: wp(100),
    marginTop: 5,
    height: 50,
    backgroundColor: 'white',
  },
  input: {
    width: wp(90),
    color: 'black',
    backgroundColor: 'white',
    borderColor: 'grey',
  },
});

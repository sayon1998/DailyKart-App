/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import axios from 'axios';
import React, {Component} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import CardView from 'react-native-cardview';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Carousel from 'react-native-snap-carousel';
import Icon from 'react-native-vector-icons/FontAwesome';
import SkeletonContent from 'react-native-skeleton-content-nonexpo';

import Color from '../../services/color';
import Global from '../../services/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

const {width, height} = Dimensions.get('window');

export default class Home extends Component {
  constructor() {
    super();
    this.state = {
      sliderWidth: width,
      itemWidth: width,
      isEditable: false,
      refresh: false,
      isInfiniteScroll: false,
      isLoading: true,
      startIndex: 0,
      limit: 6,
      totalLimit: 0,
      responseLimit: 0,
      entries: [
        {
          title: 'Item 1',
          text: 'Text 1',
        },
        {
          title: 'Item 2',
          text: 'Text 2',
        },
        {
          title: 'Item 3',
          text: 'Text 3',
        },
        {
          title: 'Item 4',
          text: 'Text 4',
        },
        {
          title: 'Item 5',
          text: 'Text 5',
        },
      ],
      items: [],
      categoryList: [
        {
          _id: '1',
          name: 'Vegetables',
          img: 'https://res.cloudinary.com/dzruu87x0/image/upload/v1622110593/jqmvzre1dmafgublrwpw.jpg',
          link: 'Category',
        },
        {
          _id: '2',
          name: 'Fish',
          img: 'https://res.cloudinary.com/dzruu87x0/image/upload/v1609009695/samples/food/fish-vegetables.jpg',
          link: 'Category',
        },
        {
          _id: '3',
          name: 'Spices',
          img: 'https://res.cloudinary.com/dzruu87x0/image/upload/v1609009703/samples/food/spices.jpg',
          link: 'Category',
        },
        {
          _id: '4',
          name: 'Dessert',
          img: 'https://res.cloudinary.com/dzruu87x0/image/upload/v1609009694/samples/food/dessert.jpg',
          link: 'Category',
        },
        {
          _id: '5',
          name: 'Pot Mussels',
          img: 'https://res.cloudinary.com/dzruu87x0/image/upload/v1609009695/samples/food/pot-mussels.jpg',
          link: 'Category',
        },
      ],
    };
  }
  componentDidMount() {
    this.makeProductRequest();
    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      this.setState({
        items: await Global.checkWishList(this.state.items),
      });
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  makeProductRequest = async () => {
    let param = {
      startIndex: String(this.state.startIndex),
      limit: this.state.limit,
    };
    const apiURL = Global.apiURL + 'product/products';
    await axios
      .post(apiURL, param)
      .then(async response => {
        // console.log(JSON.stringify(response.data.data));
        if (
          response.data &&
          response.data.status &&
          response.data.data &&
          response.data.data.productDetails &&
          response.data.data.productDetails.length > 0
        ) {
          this.setState({
            responseLimit: ++this.state.responseLimit,
            isLoading: false,
            items: [
              ...this.state.items,
              ...(await Global.checkWishList(
                response.data.data.productDetails,
              )),
            ],
            totalLimit: response.data.data.totalLimit,
            refresh: false,
            isInfiniteScroll: false,
          });
        } else {
          this.setState({
            refresh: false,
            isInfiniteScroll: false,
            totalLimit: response.data.data.totalLimit,
            limit: response.data.data.totalLimit,
            isLoading: false,
            responseLimit: ++this.state.responseLimit,
          });
          Global.toasterMessage('No more products is available!');
        }
        console.log(this.state.items.length);
      })
      .catch(err => {
        console.log(err.message);
        this.setState({
          isLoading: false,
          isInfiniteScroll: false,
          refresh: false,
          responseLimit: ++this.state.responseLimit,
        });
        // Global.toasterMessage(err.response.data.message);
      });
  };

  _renderBannerItem = ({item, index}) => {
    return (
      <View style={styles.slide}>
        <Text style={styles.title}>{item.title}</Text>
      </View>
    );
  };
  handleRefresh = () => {
    console.log('handleRefresh');
    this.setState(
      {
        isLoading: true,
        refresh: true,
        startIndex: 0,
        limit: 6,
        totalLimit: 0,
        items: [],
        responseLimit: 0,
      },
      () => {
        this.makeProductRequest();
      },
    );
  };
  handleLoadMore = () => {
    console.log('handleLoadMore', this.state.limit, this.state.totalLimit);
    if (this.state.limit < this.state.totalLimit) {
      this.setState(
        {
          startIndex: this.state.startIndex + this.state.limit,
          isInfiniteScroll: true,
        },
        () => {
          this.makeProductRequest();
        },
      );
    } else {
      Global.toasterMessage('All Products Loaded!');
    }
  };
  _renderProducts = () => {
    return (
      <FlatList
        data={this.state.items}
        numColumns={2}
        keyExtractor={item => item._id}
        scrollEnabled={true}
        renderItem={({item, index}) => (
          <CardView
            key={index}
            style={styles.cardContainer}
            cardElevation={5}
            cardMaxElevation={2}
            cornerRadius={10}>
            <Image style={styles.imgContainer} source={{uri: item.img}} />
            <TouchableOpacity
              style={styles.wishList}
              onPress={async () => {
                if (item.icon.includes('-')) {
                  await Global.onClickCartWishList(
                    'wishlistAdd',
                    item._id,
                    item.name,
                  ).then(async value => {
                    console.log(value);
                    if (value) {
                      this.setState({
                        items: await Global.checkWishList(this.state.items),
                      });
                    }
                  });
                } else {
                  await Global.onClickCartWishList(
                    'wishlistDelete',
                    item._id,
                    item.name,
                  ).then(async value => {
                    if (value) {
                      this.setState({
                        items: await Global.checkWishList(this.state.items),
                      });
                    }
                  });
                }
              }}>
              <Icon
                name={item.icon}
                size={25}
                color={item.icon.includes('-') ? 'black' : 'red'}
              />
            </TouchableOpacity>

            <View style={{height: height / 3}}>
              <View style={{flexDirection: 'column', margin: hp(0.5)}}>
                <Text style={{fontSize: 17}}>
                  {item.name && item.name.length > 20
                    ? item.name.slice(0, 20) + '...'
                    : item.name}
                </Text>
                {item.totalrating ? (
                  <View style={{flexDirection: 'row'}}>
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
        )}
        ListFooterComponent={() =>
          this.state.isInfiniteScroll ? (
            <ActivityIndicator size="large" color={Color.primary} />
          ) : null
        }
        refreshing={this.state.refresh}
        onRefresh={this.handleRefresh}
        onEndReached={this.handleLoadMore}
        onEndReachedThreshold={0}
      />
    );
  };
  _renderCategory = () => {
    return (
      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        legacyImplementation={false}
        style={styles.categoryContainer}
        data={this.state.categoryList}
        keyExtractor={item => item._id}
        scrollEnabled={true}
        renderItem={({item, index}) => (
          <TouchableWithoutFeedback
            onPress={() => {
              this.props.navigation.navigate(item.link, {
                categoryName: item.name,
              });
            }}>
            <CardView
              key={index}
              style={styles.categoryContent}
              cardElevation={5}
              cardMaxElevation={2}
              cornerRadius={100}>
              <Image style={styles.categoryImage} source={{uri: item.img}} />
            </CardView>
          </TouchableWithoutFeedback>
        )}
      />
    );
  };
  render() {
    return (
      <View style={styles.mainContainer}>
        {!this.state.isInfiniteScroll &&
        !this.state.isLoading &&
        !this.state.refresh &&
        this.state.responseLimit === 1 &&
        this.state.items &&
        this.state.items.length === 0 ? (
          <View style={styles.somethingWentWrong}>
            <Image
              source={require('../../assets/images/no-product-found.jpg')}
            />
            <Text style={{fontSize: 25, fontWeight: 'bold'}}>
              Oops, Something went wrong !!!
            </Text>
            <Text style={{fontSize: 20, color: 'gray'}}>
              Please try after sometime
            </Text>
          </View>
        ) : (
          <View>
            {!this.state.isLoading ? (
              <View style={{height: height / 5}}>
                <Carousel
                  ref={c => {
                    this._carousel = c;
                  }}
                  data={this.state.entries}
                  renderItem={this._renderBannerItem}
                  sliderWidth={this.state.sliderWidth}
                  itemWidth={this.state.itemWidth}
                  enableSnap={true}
                  autoplay={true}
                  enableMomentum={true}
                  loop={true}
                />
              </View>
            ) : (
              <SkeletonContent
                containerStyle={{}}
                isLoading={this.state.isLoading}
                animationDirection="diagonalDownRight"
                layout={[
                  {
                    key: '1',
                    width: wp(96),
                    height: height / 5.5,
                    margin: hp(1),
                    borderRadius: 5,
                  },
                ]}
              />
            )}

            {this.state.isLoading ? (
              <SkeletonContent
                containerStyle={{flexDirection: 'row'}}
                isLoading={this.state.isLoading}
                animationDirection="diagonalDownRight"
                layout={[
                  {
                    key: '1',
                    width: 80,
                    height: 80,
                    margin: hp(1),
                    borderRadius: 100,
                  },
                  {
                    key: '2',
                    width: 80,
                    height: 80,
                    margin: hp(1),
                    borderRadius: 100,
                  },
                  {
                    key: '3',
                    width: 80,
                    height: 80,
                    margin: hp(1),
                    borderRadius: 100,
                  },
                  {
                    key: '4',
                    width: 80,
                    height: 80,
                    margin: hp(1),
                    borderRadius: 100,
                  },
                  {
                    key: '5',
                    width: 80,
                    height: 80,
                    margin: hp(1),
                    borderRadius: 100,
                  },
                ]}
              />
            ) : (
              this._renderCategory()
            )}
            <View style={{borderBottomWidth: 0.5}}>
              <Text
                style={{
                  fontSize: 25,
                  fontWeight: 'bold',
                  alignSelf: 'flex-start',
                  marginLeft: hp(1),
                  marginBottom: hp(1),
                }}>
                Latest products
              </Text>
            </View>
            <SkeletonContent
              containerStyle={{
                flex: 1,
                flexDirection: 'row',
                flexWrap: 'wrap',
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
              ]}
            />
            {this._renderProducts()}
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
    // alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255,.8)',
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
  cardContainer: {
    width: 180,
    height: 200,
    backgroundColor: 'white',
    margin: hp(1),
  },
  categoryContainer: {
    width: width + 5,
    flex: 1,
    flexGrow: 0,
    minHeight: 100,
    flexDirection: 'row',
  },
  categoryContent: {
    width: 80,
    height: 80,
    margin: 5,
    justifyContent: 'center',
  },
  categoryImage: {
    width: 70,
    height: 70,
    maxWidth: 70,
    maxHeight: 70,
    borderRadius: 100,
    alignSelf: 'center',
  },
  slide: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    height: 150,
    padding: 50,
    marginTop: 5,
    marginLeft: 5,
    marginRight: 5,
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
  somethingWentWrong: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  Button,
  TouchableOpacity,
} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
// Navigator Function
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
// Component
import Splash_Screen from './src/screens/splash/Splash_Screen';
import Home from './src/screens/home/Home';
import Auth from './src/screens/auth/Auth';
import Register from './src/screens/auth/Register';

import {useDoubleBackPressExit} from './src/services/exitByDoublePress';
import DrawerContainer from './src/screens/drawer/DrawerContainer';
import Color from './src/services/color';
import Icon from 'react-native-vector-icons/Ionicons';
import Profile from './src/screens/profile/Profile';
import Orders from './src/screens/order/Orders';
import Account from './src/screens/account/Account';
import Category from './src/screens/category/Category';
import Wishlist from './src/screens/wishlist/Wishlist';
import Cart from './src/screens/cart/Cart';
import Reward from './src/screens/Rewards/Reward';

const main = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const screenOptionStyle = {
  headerStyle: {
    backgroundColor: Color.primary,
  },
  headerTintColor: 'white',
  headerBackTitle: 'Back',
};

const MainStack = () => {
  return (
    <main.Navigator
      initialRouteName="Splash_Screen"
      screenOptions={{
        headerShown: false,
      }}>
      <main.Screen name="Splash_Screen" component={Splash_Screen} />
      <main.Screen name="Home" component={homeDrawer} />
      <main.Screen name="Auth" component={Auth} />
      <main.Screen name="register" component={Register} />
    </main.Navigator>
  );
};

const homeDrawer = props => {
  return (
    <Drawer.Navigator
      initialRouteName="homeStack"
      screenOptions={screenOptionStyle}
      drawerContent={props => <DrawerContainer {...props} />}>
      <Drawer.Screen
        options={{
          headerTitleStyle: {alignSelf: 'flex-start'},
          title: 'DailyKart',
          headerRight: () => (
            <View
              style={{
                marginRight: 15,
                flexDirection: 'row',
              }}>
              <TouchableOpacity>
                <Icon
                  style={{marginRight: 15}}
                  color="white"
                  name="search"
                  size={20}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate('Cart');
                }}>
                <Icon name="cart" color="white" size={20} />
              </TouchableOpacity>
            </View>
          ),
        }}
        name="homeStack"
        component={tabDrawer}
      />
      <Drawer.Screen
        options={{
          headerLeft: () => (
            <Icon
              style={{marginLeft: hp(1)}}
              onPress={() => {
                props.navigation.goBack();
              }}
              name="arrow-back"
              color="white"
              size={25}
            />
          ),
        }}
        name="Profile"
        component={Profile}
      />
      <Drawer.Screen
        options={{
          headerLeft: () => (
            <Icon
              style={{marginLeft: hp(1)}}
              onPress={() => {
                props.navigation.goBack();
              }}
              name="arrow-back"
              color="white"
              size={25}
            />
          ),
        }}
        name="Orders"
        component={Orders}
      />
      <Drawer.Screen
        options={{
          headerLeft: () => (
            <Icon
              style={{marginLeft: hp(1)}}
              onPress={() => {
                props.navigation.goBack();
              }}
              name="arrow-back"
              color="white"
              size={25}
            />
          ),
        }}
        name="Wishlist"
        component={Wishlist}
      />
      <Drawer.Screen
        options={{
          headerLeft: () => (
            <Icon
              style={{marginLeft: hp(1)}}
              onPress={() => {
                props.navigation.goBack();
              }}
              name="arrow-back"
              color="white"
              size={25}
            />
          ),
        }}
        name="Cart"
        component={Cart}
      />
      <Drawer.Screen
        options={{
          headerLeft: () => (
            <Icon
              style={{marginLeft: hp(1)}}
              onPress={() => {
                props.navigation.goBack();
              }}
              name="arrow-back"
              color="white"
              size={25}
            />
          ),
        }}
        name="Category"
        component={Category}
      />
    </Drawer.Navigator>
  );
};

const tabDrawer = props => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Reward') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }

          // You can return any component that you like here!
          return <Icon name={iconName} size={size} color={color} />;
        },
        lazy: true,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Color.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Reward" component={Reward} />
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  useDoubleBackPressExit(() => {});
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar />
      {/* barStyle={isDarkMode ? 'light-content' : 'dark-content'} */}
      <View
        style={{
          backgroundColor: isDarkMode ? Colors.black : Colors.white,
          width: wp(100),
          height: hp(100),
        }}>
        <NavigationContainer>
          <MainStack />
        </NavigationContainer>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;

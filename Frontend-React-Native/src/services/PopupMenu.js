/* eslint-disable prettier/prettier */
import React, {Component, PropTypes} from 'react';
import {View, UIManager, findNodeHandle, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ICON_SIZE = 25;

export default class PopupMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      icon: null,
    };
  }

  onError() {
    console.log('Popup Error');
  }

  onPress = () => {
    if (this.state.icon) {
      UIManager.showPopupMenu(
        findNodeHandle(this.state.icon),
        this.props.actions,
        this.onError,
        this.props.onPress,
      );
    }
  };
  render() {
    const {item} = this.props;
    return (
      <View>
        <TouchableOpacity
          onPress={this.onPress}
          onPressOut={() => {
            this.props.onClick(this.props.item);
          }}>
          <Icon
            name="more-vert"
            size={ICON_SIZE}
            color={'grey'}
            ref={this.onRef}
          />
        </TouchableOpacity>
      </View>
    );
  }

  onRef = icon => {
    if (!this.state.icon) {
      this.setState({icon});
    }
  };
}

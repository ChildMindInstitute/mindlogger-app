import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, ScrollView, Modal, Text } from 'react-native';

import { ViewPropTypes, withTheme } from 'react-native-elements/src/config';
import { ScreenWidth, ScreenHeight, isIOS } from 'react-native-elements/src/helpers';

import Triangle from 'react-native-elements/src/tooltip/Triangle';
import getTooltipCoordinate, {
  getElementVisibleWidth,
} from 'react-native-elements/src/tooltip/getTooltipCoordinate';

class CustomToolTip extends React.PureComponent {
  state = {
    isVisible: false,
    yOffset: 0,
    xOffset: 0,
    elementWidth: 0,
    elementHeight: 0,
  };

  renderedElement;

  toggleTooltip = () => {
    const { onClose } = this.props;
    this.getElementPosition();
    this.setState(prevState => {
      if (prevState.isVisible && !isIOS) {
        onClose && onClose();
      }

      return { isVisible: !prevState.isVisible };
    });
  };

  wrapWithPress = (toggleOnPress, children) => {
    if (toggleOnPress) {
      return (
        <TouchableOpacity onPress={this.toggleTooltip} activeOpacity={1}>
          {children}
        </TouchableOpacity>
      );
    }

    return children;
  };

  getTooltipStyle = () => {
    const { yOffset, xOffset, elementHeight, elementWidth } = this.state;
    const {
      height,
      backgroundColor,
      width,
      withPointer,
      containerStyle,
    } = this.props;

    const { x, y } = getTooltipCoordinate(
      xOffset,
      yOffset,
      elementWidth,
      elementHeight,
      ScreenWidth,
      ScreenHeight,
      width,
      height,
      withPointer
    );

    return {
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      backgroundColor,
      // default styles
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      borderRadius: 10,
      padding: 10,
      ...containerStyle,
    };
  };

  renderPointer = tooltipY => {
    const { yOffset, xOffset, elementHeight, elementWidth } = this.state;
    const { backgroundColor, pointerColor } = this.props;
    const pastMiddleLine = yOffset > tooltipY;

    return (
      <View
        style={{
          position: 'absolute',
          top: pastMiddleLine ? yOffset - 13 : yOffset + elementHeight - 2,
          left:
            xOffset +
            getElementVisibleWidth(elementWidth, xOffset, ScreenWidth) / 2 -
            7.5,
        }}
      >
        <Triangle
          style={{ borderBottomColor: pointerColor || backgroundColor }}
          isDown={pastMiddleLine}
        />
      </View>
    );
  };

  renderContent = withTooltip => {
    const { popover, withPointer, toggleOnPress, highlightColor } = this.props;

    if (!withTooltip)
      return this.wrapWithPress(toggleOnPress, this.props.children);

    const { yOffset, xOffset, elementWidth, elementHeight } = this.state;
    const tooltipStyle = this.getTooltipStyle();
    return (
      <View>
        <View
          style={{
            position: 'absolute',
            top: yOffset,
            left: xOffset,
            backgroundColor: highlightColor,
            overflow: 'visible',
            width: elementWidth,
            height: elementHeight,
          }}
        >
          {this.props.children}
        </View>
        {withPointer && this.renderPointer(tooltipStyle.top)}
        <View style={tooltipStyle} testID="tooltipPopoverContainer"
          onStartShouldSetResponder={(evt) => {
            evt.stopPropagation();
            return false;
          }}
        >
            <ScrollView>
              {popover}
            </ScrollView>
        </View>
      </View>
    );
  };

  componentDidMount() {
    // wait to compute onLayout values.
    setTimeout(this.getElementPosition, 500);
  }

  getElementPosition = () => {
    this.renderedElement &&
      this.renderedElement.measure(
        (
          frameOffsetX,
          frameOffsetY,
          width,
          height,
          pageOffsetX,
          pageOffsetY
        ) => {
          this.setState({
            xOffset: pageOffsetX,
            yOffset: pageOffsetY,
            elementWidth: width,
            elementHeight: height,
          });
        }
      );
  };

  render() {
    const { isVisible } = this.state;
    const { withOverlay } = this.props;

    return (
      <View
        collapsable={false}
        ref={e => {
          this.renderedElement = e;
        }}
      >
        {this.renderContent(false)}
        <Modal
          animationType="fade"
          visible={isVisible}
          transparent
        >
          <View
            style={styles.container(withOverlay)}
            activeOpacity={1}
            onStartShouldSetResponder={()=>true}
            onResponderRelease={
              () => {
                this.toggleTooltip();
              }
            }
          >
            {this.renderContent(true)}
          </View>
        </Modal>
      </View>
    );
  }
}

CustomToolTip.propTypes = {
  children: PropTypes.element,
  withPointer: PropTypes.bool,
  popover: PropTypes.element,
  toggleOnPress: PropTypes.bool,
  height: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  containerStyle: ViewPropTypes.style,
  pointerColor: PropTypes.string,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  withOverlay: PropTypes.bool,
  backgroundColor: PropTypes.string,
  highlightColor: PropTypes.string,
};

CustomToolTip.defaultProps = {
  withOverlay: true,
  highlightColor: 'transparent',
  withPointer: true,
  toggleOnPress: true,
  height: 40,
  width: 150,
  containerStyle: {},
  backgroundColor: '#617080',
  onClose: () => {},
  onOpen: () => {},
};

const styles = {
  container: (withOverlay) => ({
    backgroundColor: withOverlay ? 'rgba(250, 250, 250, 0.70)' : 'transparent',
    flex: 1,
  }),
};

export { CustomToolTip };
export default withTheme(CustomToolTip, 'RNEModalTooltip');

# Widget Development Guide

Widgets are simply React components that can be used in Activities. They have a simple and predictable event-driven interface.

A widget's state is controlled by its parent, the `Screen` component. See the **Hooking up the widget** section below.

## Configuration

Widgets define their own configuration, expected value format, and validation. The first step when developing a new widget is to define the data structure for each.

A widget should accept a `config` For example, a `Select` (i.e. Dropdown) widget might expect its configuration object as follows (using React PropTypes):

```js
{
  label: PropTypes.string.isRequired,
  explanatoryText: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    key: PropTypes.string,
  })).isRequired,
}
```

## Value

The user's response/interaction to the widget will be saved as a JavaScript object into the redux store and uploaded to the server as JSON. This means that the answer **must** be in a format that can be serialized. References to other objects or functions should not be used as answers.

For our `Select` widget, the `value` prop could simply be an object that corresponds to the option the user has selected.

## Validation

A widget can define its own custom validation. This will impact whether the user can press "Next" on an activity, among other things.

By default, a widget is valid if the current `value` is not `null` or `undefined`.

If you want to define a custom validation function, your widget must be a class component that defines a `static` method called `isValid`. The function will receive a value as its first parameter and config as its second.

For example, if we wanted our `Select` component to only be considered valid when the user selected the second option, then we could add a validation function as follows:

```js
import React from 'react';

class Select extends React.Component {
  static isValid(value = {}, config) {
    const selectedIndex = config.options.findIndex(item => item.key === value.key);
    return selectedIndex === 1; // Will return "true" if second option is selected
  }

  ... // The rest of the component
}
```

## Change handler

Your widget should receive a prop called `onChange` or similar for the user to pass in a callback. Your widget should call the callback whenever the user updates the `value` of the widget.

## Putting it together

Altogether, our `Select` widget could look something like the following:

```js
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity } from 'react-native';

class Select extends React.Component {
  static isValid(value = {}, config) {
    const selectedIndex = config.options.findIndex(item => item.key === value);
    return selectedIndex === 1; // Will return "true" if second option is selected
  }

  constructor() {
    super();
    this.state = {
      selectOpen: false,
    };
  }

  toggle = () => {
    const prev = this.state.selectOpen;
    this.setState({
      selectOpen: !prev,
    });
  }

  render() {
    const { value, config, onChange } = this.props;
    const { selectOpen } = this.state;
    return (
      <View>
        <Text>{config.label}</Text>
        <Text>{config.explanatoryText}</Text>
        <TouchableOpacity onPress={this.toggle}>
          <View>
            <Text>{value ? value.label : 'Select...'}</Text>
          </View>
        </TouchableOpacity>
        {selectOpen && (
          <View>
            {config.options.map(option => (
              <TouchableOpacity
                key={option.key}
                onPress={() => {
                  onChange(option);
                  this.toggle();
                }}
              >
                <View>
                  <Text>{option.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    )
  }
}

Select.defaultProps = {
  value: undefined,
};

Select.propTypes = {
  value: PropTypes.shape({
    label: PropTypes.string,
    key: PropTypes.string,
  }),
  config: PropTypes.shape({
    label: PropTypes.string.isRequired,
    explanatoryText: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      key: PropTypes.string,
    })).isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Select;
```

## Hooking up the widget

Now that your widget is looking good and implements the basic widget interface, you'll need to add it to the `Screen` component. Head on over into `app/components/screen/index.js`.

In the `renderWidget` function, add your new widget component.

```js
import Select from '../../widgets/Select.js';

...
  renderWidget() {
    const { screen, answer, onChange } = this.props;
    ...
    if (screen.inputType === 'select') {
      return (
        <Select
          config={screen.inputs}
          value={answer}
          onChange={onChange}
        />
      );
    }
  }
```

The `onChange` function will update the redux store. `answer` is pulled in directly from redux and will be `undefined` or `null` initially. 

## Backend

The `Screen` component gets a prop called `screen` which is supplied from the backend. An admin user configures the `screen` which is then downloaded when the user syncs up their app to the backend.

You must ensure that `screen` matches what your widget is expecting as a configuration object.
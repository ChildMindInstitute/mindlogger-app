import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
	selected: {
		borderRadius: 10,
		backgroundColor: '#FFDC86',
		padding: 5,
		minWidth: 40
	}
})

const RangeSelector = ({ value, onChange, options, disabled }) => {
	return (
		<View style={{
			justifyContent: 'space-between',
			flexDirection: 'row',
			marginVertical: 10,
			width: '100%'
		}}>
			{
				options.map((option, index) => (
					<TouchableOpacity
						disabled={disabled}
						key={index}
						style={value == option ? styles.selected : { padding: 5 }}
						onPress={() => {
							if (!disabled) {
								onChange(option)
							}
						}}
					>
						<Text style={{ textAlign: 'center', ...(disabled ? { color: 'grey' } : {}) }}>{option}</Text>
					</TouchableOpacity>
				))
			}
		</View>
	)
}

RangeSelector.defaultProps = {
	value: 'Today',
	options: ['Today', '1w', '2w', '1m', '3m', '1y', 'All'],
	disabled: false
}

RangeSelector.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func,
	options: PropTypes.array,
	disabled: PropTypes.bool
}

export default RangeSelector;

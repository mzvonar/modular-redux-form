import React from 'react';
import PropTypes from 'prop-types';
import ConnectedArray from './ConnectedArray';

class Array extends React.Component {
    static get propTypes() {
        return {
            component: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
            name: PropTypes.string.isRequired
        }
    }

    static get contextTypes() {
        return {
            _mrf: PropTypes.shape({
                getFormState: PropTypes.func.isRequired,
                registerInput: PropTypes.func.isRequired,
                removeInput: PropTypes.func.isRequired
            })
        }
    }

    constructor(props, context) {
        super(props, context);

        if(!this.context._mrf) {
            throw new Error('Array has to be inside connected form.');
        }
        if(!this.props.component) {
            throw new Error('Prop "component" not provided to Array');
        }
    }

    render() {
        return React.createElement(ConnectedArray, Object.assign({}, this.props, {
            _mrf: this.context._mrf
        }));
    }
}

export default Array;
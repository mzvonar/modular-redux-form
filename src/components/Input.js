import React from 'react';
import PropTypes from 'prop-types';
import ConnectedInput from './ConnectedInput';

class Input extends React.Component {
    static get propTypes() {
        return {
            component: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
            name: PropTypes.string.isRequired
        }
    }

    static get defaultProps() {
        return {
            component: 'input'
        }
    }

    static get contextTypes() {
        return {
            _mrf: PropTypes.shape({
                getFormState: PropTypes.func,
                registerInput: PropTypes.func,
                inputChange: PropTypes.func,
                inputBlur: PropTypes.func
            })
        }
    }

    constructor(props, context) {
        super(props, context);

        if(!this.context._mrf) {
            throw new Error('Input has to be inside connected form.');
        }
    }

    render() {
        return React.createElement(ConnectedInput, Object.assign({}, this.props, {
            _mrf: this.context._mrf
        }));
    }
}

export default Input;
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import getIn from '@mzvonar/getin';
import isEvent from './../utils/isEvent';
import getPath from './../utils/getPath';
import deepEqual from 'react-fast-compare';

function deleteChildren(object, children) {
    let deleted = {};

    for(let i = 0, length = children.length; i < length; i += 1) {
        const key = children[i];
        if(Object.prototype.hasOwnProperty.call(object, key)) {
            deleted[key] = object[key];
            delete object[key];
        }
    }

    return deleted;
}

function cleanComponentProps(value, props) {
    const componentProps = Object.assign({}, props);

    const input = componentProps.input;
    // const value = componentProps.value;

    deleteChildren(componentProps, [
        'component',
        '_mrf',
        'input',
        'value',
        'validate',
        'formSubmitted',
        'readOnly',
        'disabled'
    ]);

    const inputProps = {};

    if(componentProps.type === 'radio') {
        inputProps.checked = value === componentProps.value;
    }
    else if(componentProps.type === 'checkbox') {
        inputProps.checked = !!value;
    }
    else {
        inputProps.value = typeof value !== 'undefined' ? value : /*(!props.input.dirty ? props.initialValue : '') ||*/ '';
    }

    inputProps.id = props.id;
    inputProps.readOnly = props.readOnly;
    inputProps.disabled = props.disabled;
    inputProps.autoComplete = props.autoComplete;
    inputProps.maxLength = props.maxLength;

    componentProps.input = inputProps;

    return componentProps;
}

function getValue(event) {
    if(isEvent(event)) {
        return event.target.value;
    }
    else {
        return event;
    }
}

function generateErrorMessages(errors, errorMessages) {
    const messages = [];

    if(errors && errors.length > 0 && errorMessages) {
        for(let i = 0, length = errors.length; i < length; i += 1) {
            if(errorMessages[errors[i]]) {
                messages.push(errorMessages[errors[i]]);
            }
        }
    }

    return messages;
}

const ignoreForUpdate = [
    '_mrf'
];

class ConnectedInput extends React.Component {
    static get propTypes() {
        return {
            component: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
            name: PropTypes.string.isRequired
        }
    }

    static get defaultProps() {
        return {
            component: 'input',
        }
    }

    constructor(props, context) {
        super(props, context);

        this.state = {
            value: props.value
        };

        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    componentDidMount() {
        this.props._mrf.registerInput(this.props.name, {
            required: this.props.required,
            validate: this.props.validate,
            value: (this.props.type === 'hidden' && this.props.inputValue) ? this.props.inputValue : undefined
        }, this.props.initialValue, this.props.initialErrors);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if(nextProps.value !== this.props.value) {
            this.setState({
                value: nextProps.value
            });
        }
        if(this.props.type === 'hidden' && nextProps.inputValue !== this.props.inputValue) {
            this.props._mrf.inputChange(this.props.name, nextProps.inputValue);
        }
    }

    componentWillUnmount() {
        this.props._mrf.removeInput(this.props.name);
    }

    shouldComponentUpdate(nextProps, nextState) {
        const nextPropsKeys = Object.keys(nextProps);
        const thisPropsKeys = Object.keys(this.props);

        if(nextPropsKeys.length !== thisPropsKeys.length || nextState.value !== this.state.value) {
            return true;
        }

        for(let i = 0, length = nextPropsKeys.length; i < length; i += 1) {
            const key = nextPropsKeys[i];

            if(!~ignoreForUpdate.indexOf(key) && !deepEqual(this.props[key], nextProps[key])) {
                return true
            }
        }

        return false;
    }

    // UNSAFE_componentWillReceiveProps(nextProps) {
    //     if(this.props.type === 'hidden' && nextProps.value !== this.props.value) {
    //         this.onChange(nextProps.value);
    //     }
    // }

    onChange(e) {
        const value = getValue(e);

        this.setState({
            value: value
        });

        this.props._mrf.inputChange(this.props.name, value);

        if(this.props.onChange) {
            this.props.onChange(e);
        }
    }

    onBlur(e) {
        this.props._mrf.inputBlur(this.props.name);

        if(this.props._mrf.asyncValidate) {
            this.props._mrf.asyncValidate(this.props.name, getValue(e), true, false);
        }

        if(this.props.onBlur) {
            this.props.onBlur(e);
        }
    }

    render() {
        const formSubmitted = this.props.formSubmitted;
        let componentProps = cleanComponentProps(this.state.value, this.props);
        componentProps.input.onChange = this.onChange;
        componentProps.input.onBlur = this.onBlur;


        if(typeof this.props.component === 'string') {
            return React.createElement(this.props.component, Object.assign(componentProps.input, {
                type: this.props.type,
                className: this.props.className
            }));
        }
        else {
            return React.createElement(this.props.component, Object.assign(componentProps, {
                meta: {
                    pristine: this.props.input.pristine,
                    dirty: this.props.input.dirty,
                    touched: formSubmitted === true ? true : this.props.input.touched,
                    valid: this.props.input.valid,
                    errors: this.props.input.errors,
                    errorMessages: generateErrorMessages(this.props.input.errors, this.props.errors),
                    initialErrors: this.props.input.initialErrors,
                    asyncValidation: this.props.input.asyncValidation,
                    asyncErrors: this.props.input.asyncErrors,
                    formSubmitted: formSubmitted
                }
            }));
        }
    }
}

function mapStateToProps(state, ownProps) {
    const formState = ownProps._mrf.getFormState(state);

    return {
        input: getIn(formState, ['inputs', ownProps.name]) || {},
        value: getIn(formState, ['values', ...getPath(ownProps.name)]),
        initialValue: getIn(formState, ['initialValues', ...getPath(ownProps.name)]),
        initialErrors: getIn(formState, ['initialInputErrors', ownProps.name]),
        inputValue: ownProps.value,
        formSubmitted: getIn(formState, 'submitted', false)
    }
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedInput);
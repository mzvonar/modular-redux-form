import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import getIn from '@mzvonar/getin';
import isEvent from './../utils/isEvent';
import deepEqual from 'deep-equal';

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

function cleanComponentProps(props) {
    const componentProps = Object.assign({}, props);

    const input = componentProps.input;

    deleteChildren(componentProps, [
        'component',
        '_mrf',
        'input',
        'validate',
        'formSubmitted'
    ]);

    const inputProps = {};

    if(componentProps.type === 'radio') {
        inputProps.checked = input.value === componentProps.value;
    }
    else if(componentProps.type === 'checkbox') {
        inputProps.checked = !!input.value;
    }
    else {
        inputProps.value = (input && input.value) || (!props.input.dirty ? props.initialValue : '') || '';
    }

    componentProps.input = inputProps;

    return componentProps
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

class Input extends React.Component {
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

        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    componentWillMount() {
        this.props._mrf.registerInput(this.props.name, {
            required: this.props.required,
            validate: this.props.validate
        }, this.props.initialValue, this.props.initialErrors);
    }

    componentWillUnmount() {
        this.props._mrf.removeInput(this.props.name);
    }

    shouldComponentUpdate(nextProps, nextState) {
        const nextPropsKeys = Object.keys(nextProps);
        const thisPropsKeys = Object.keys(this.props);

        if(nextPropsKeys.length !== thisPropsKeys.length) {
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

    // componentWillReceiveProps(nextProps) {
    //     if(this.props.type === 'hidden' && nextProps.value !== this.props.value) {
    //         this.onChange(nextProps.value);
    //     }
    // }

    onChange(e) {
        this.props._mrf.inputChange(this.props.name, getValue(e));

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
        let componentProps = cleanComponentProps(this.props);
        Object.assign(componentProps.input, {
            onChange: this.onChange,
            onBlur: this.onBlur,
        });


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
        initialValue: getIn(formState, ['initialValues', ownProps.name]),
        initialErrors: getIn(formState, ['initialInputErrors', ownProps.name]),
        formSubmitted: getIn(formState, 'submitted', false)
    }
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Input);
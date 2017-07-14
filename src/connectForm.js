import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import actions from './actions';
import isEvent from './utils/isEvent';

function isPromise(obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

const silenceEvent = event => {
    const is = isEvent(event)
    if (is) {
        event.preventDefault()
    }
    return is
};

function checkHasError(formState) {
    let hasError = false;

    if(formState) {
        for(const key in formState.inputs) {
            if(Object.prototype.hasOwnProperty.call(formState.inputs, key)) {
                if(formState.inputs[key].hasError) {
                    hasError = true;
                    break;
                }
            }
        }
    }

    return hasError;
}

function validateFrom(formState) {
    let isValid = true;

    for(const key in formState.inputs) {
        if(Object.prototype.hasOwnProperty.call(formState.inputs, key)) {
            const input = formState.inputs[key];

            if(formState.inputs[key].hasError) {
                hasError = true;
                break;
            }
        }
    }


    return hasError;
}

function getFormValues(formState) {
    const data = {};

    if(formState) {
        for(const key in formState.inputs) {
            if(Object.prototype.hasOwnProperty.call(formState.inputs, key)) {
                data[key] = formState.inputs[key].value;
            }
        }
    }

    return data;
}

const connectForm = initialConfig => {
    const config = Object.assign({
        touchOnBlur: true,
        touchOnChange: false
    }, initialConfig);

    return WrappedComponent => {
        class ModularReduxForm extends React.Component {
            static get propTypes() {
                return {
                    form: PropTypes.string.isRequired
                }
            }

            static get childContextTypes() {
                return {
                    _mrf: PropTypes.shape({
                        getFormState: PropTypes.func,
                        registerInput: PropTypes.func,
                        inputChange: PropTypes.func,
                        inputBlur: PropTypes.func,
                        asyncValidate: PropTypes.func
                    })
                }
            }

            getChildContext() {
                return {
                    _mrf: {
                        getFormState: state => state.modularReduxForm[this.props.form],
                        registerInput: this.props.registerInput,
                        removeInput: this.props.removeInput,
                        inputChange: this.props.inputChange,
                        inputBlur: this.props.inputBlur,
                        asyncValidate: this.asyncValidate
                    }
                }
            }

            constructor(props) {
                super(props);

                if(!props.form) {
                    throw new Error('Connected form needs "form" prop. Provide it either in connectForm config or in props');
                }

                this.submitForm = this.submitForm.bind(this);
                this.asyncValidate = this.asyncValidate.bind(this);
                this.createComponentProps = this.createComponentProps.bind(this);
            }

            componentWillMount() {
                this.props.registerForm({
                    initialValues: config.initialValues || this.props.initialValues,
                    initialFormErrors: config.initialFormErrors || this.props.initialFormErrors,
                    initialInputErrors: config.initialInputErrors || this.props.initialInputErrors
                });
            }

            componentWillUnmount() {
                this.props.removeForm();
            }

            asyncValidate(name, value, blur, change) {
                if(this.props.asyncValidation) {
                    const submitting = !blur && !change;

                    const checkName = (inputNames, name) => inputNames && inputNames.indexOf(name) > -1;

                    if(submitting || (blur && checkName(this.props.asyncBlurInputs, name)) || (change && checkName(this.props.asyncChangeInputs, name)) ) {
                        const values = getFormValues(this.props.formState);


                        this.props.asyncValidateStart(name);
                        const asyncValidationPromise = this.props.asyncValidation(values, this.createComponentProps());

                        if(!isPromise(asyncValidationPromise)) {
                            throw new Error('Async validation function did not return a promise');
                        }

                        return asyncValidationPromise
                            .then(() => {
                                this.props.asyncValidateFinished(name)
                            })
                            .catch(errors => {
                                if(errors && !Object.keys(errors).length) {
                                    // Errors is normal error somewhere in code, so throw it
                                    throw errors;
                                }
                                else if(!errors) {
                                    throw new Error('Async validation function was rejected without errors');
                                }

                                this.props.asyncValidateFinished(name, errors);

                                return Promise.resolve(errors);
                            });
                    }
                }
            }

            submitForm(submitOrEvent) {
                // if(isEvent(submitOrEvent)) {
                //     submitOrEvent.preventDefault();
                // }
                //
                // this.props.submit(this.props.formState);
                const onSubmit = silenceEvent(submitOrEvent) ? this.props.onSubmit : submitOrEvent;

                if(!onSubmit || Object.prototype.toString.call(onSubmit) !== '[object Function]') {
                    throw new Error('onSubmit is not a function')
                }

                if(this.props.formState.valid) {
                    const doSubmit = () => {
                        const data = getFormValues(this.props.formState);

                        const result = onSubmit(data);

                        if(isPromise(result)) {
                            this.props.submitting();

                            result
                                .then(data => {
                                    setTimeout(() => this.props.submitSuccess(data), 0)
                                })
                                .catch(e => {
                                    if(process.env.NODE_ENV !== 'production') {
                                        console.error(e);
                                    }

                                    let error = e;
                                    if(e.response && e.response.body) {
                                        error = e.response.body
                                    }

                                    setTimeout(() => this.props.submitErrorAction(error), 0);
                                });
                        }
                        else {
                            this.props.submitSuccess();
                        }
                    };

                    const asyncValidateResult = this.asyncValidate();
                    if(asyncValidateResult) {
                        this.props.submitting();

                        asyncValidateResult
                            .then(errors => {
                                if(!errors) {
                                    doSubmit()
                                }
                                else {
                                    this.props.submitErrorAction();
                                }
                            })
                            .catch(e => {
                                this.props.submitErrorAction();

                                throw(e);
                            });
                    }
                    else {
                        doSubmit();
                    }
                }
                else {
                    this.props.submitErrorAction();
                }
            }

            createComponentProps() {
                return Object.assign({}, this.props.customProps, {
                    form: this.props.form,
                    pristine: this.props.formState.pristine,
                    dirty: this.props.formState.dirty,
                    valid: this.props.formState.valid,
                    touched: this.props.formState.touched,
                    submitting: this.props.formState.submitting,
                    submitted: this.props.formState.submitted,
                    submitError: this.props.formState.submitError,
                    submitSuccess: this.props.formState.submitSuccess,
                    submitForm: this.submitForm,
                    initialFormErrors: this.props.formState.initialFormErrors,
                    asyncValidation: this.props.formState.asyncValidation
                });
            }

            render() {
                const componentsProps = this.createComponentProps();

                return React.createElement(WrappedComponent, componentsProps);
            }
        }

        function mapStateToProps(state, ownProps) {
            const form = config.form || ownProps.form;

            if(!state.modularReduxForm) {
                throw new Error('modularReduxForm is undefined in state. Maybe you forgot to include the reducer?');
            }

            const formState = state.modularReduxForm[form];

            return {
                form: form,
                formState: formState || {},
                asyncValidation: config.asyncValidation || ownProps.asyncValidation,
                asyncBlurInputs: config.asyncBlurInputs || ownProps.asyncBlurInputs,
                asyncChangeInputs: config.asyncChangeInputs,
                customProps: ownProps
            }
        }

        const mapDispatchToProps = (dispatch, ownProps) => {
            const bindForm = actionCreator => actionCreator.bind(null, config.form || ownProps.form);

            return bindActionCreators({
                registerForm: bindForm(actions.registerForm),
                removeForm: bindForm(actions.removeForm),
                registerInput: bindForm(actions.registerInput),
                removeInput: bindForm(actions.removeInput),
                inputChange: bindForm(actions.inputChange).bind(null, config.touchOnChange),
                inputBlur: bindForm(actions.inputBlur).bind(null, config.touchOnBlur),
                submitting: bindForm(actions.submitting),
                submitSuccess: bindForm(actions.submitSuccess),
                submitErrorAction: bindForm(actions.submitError),
                asyncValidateStart: bindForm(actions.asyncValidateStart),
                asyncValidateFinished: bindForm(actions.asyncValidateFinished)
            }, dispatch);

        };

        ModularReduxForm = connect(mapStateToProps, mapDispatchToProps)(ModularReduxForm);

        ModularReduxForm.defaultProps = {
            // form: config.form,
            onSubmit: config.onSubmit,
            asyncValidation: config.asyncValidation
        };

        return ModularReduxForm;
    };
};

export default connectForm;

export const propTypes = {
    form: PropTypes.string,
    pristine: PropTypes.bool,
    dirty: PropTypes.bool,
    valid: PropTypes.bool,
    touched: PropTypes.bool,
    submitting: PropTypes.bool,
    submitted: PropTypes.bool,
    submitError: PropTypes.object,
    submitSuccess: PropTypes.bool,
    submitForm: PropTypes.func,
    initialFormErrors: PropTypes.array,
    asyncValidation: PropTypes.func
};

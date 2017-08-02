import reducerUtils from './utils/reducerUtils';
import constants, {prefix} from './constants';
import getIn from '@mzvonar/getin';
import setIn from '@mzvonar/setin';
import mergeIn from '@mzvonar/mergein';
import {validateInput} from './validators';

const isMRFAction = action => (
    action &&
    action.type &&
    action.type.length > prefix.length &&
    action.type.substring(0, prefix.length) === prefix
);

const createEmptyInputState = (config, initialValue, initialErrors) => {
    const state = {
        pristine: true,
        dirty: false,
        touched: false,
        valid: true,
        errors: null,
        validate: config.validate || [],
        asyncValidation: false,
        asyncErrors: [],
        initialErrors: initialErrors && (Object.keys(initialErrors).length > 0 ? initialErrors : null),
        value: initialValue
    };

    if(config.required === true) {
        state.validate.unshift('required');
    }

    return state;
};

const createEmtpyFormState = (state) => Object.assign({
    pristine: true,
    valid: true,
    touched: false,
    submitting: false,
    submitted: false,
    submitSuccess: false,
    asyncValidation: null,
    initialValues: {},
    initialFormErrors: null,
    initialInputErrors: null,
    submitError: null
}, state);

function registerForm(state, form, config = {}) {
    return setIn(state, [form], createEmtpyFormState({
        initialValues: config.initialValues || {},
        initialFormErrors: config.initialFormErrors && (config.initialFormErrors.length > 0 ? config.initialFormErrors : null),
        initialInputErrors: config.initialInputErrors
    }));
}

function removeForm(state, form) {
    // return null;
    const newState = Object.assign({}, state);
    delete newState[form];

    return newState;
}

function getAllValues(inputs) {
    const values = {};

    for(const key in inputs) {
        if(Object.prototype.hasOwnProperty.call(inputs, key)) {
            values[key] = inputs[key].value;
        }
    }

    return values;
}

function registerInput(state, name, config, initialValue, initialErrors) {
    const input = getIn(state, ['inputs', name], createEmptyInputState(config, initialValue, initialErrors));
    const errors = validateInput(input, input.value, getAllValues(getIn(state, 'inputs')));

    input.errors = errors.length > 0 ? errors : null;
    input.valid = !errors || errors.length === 0;

    return setIn(state, ['inputs', name], input);
}

// TODO: remove input cant remove inout from state, it has to only mark it as disabled

function handleInputChange(state, touch, name, value) {
    const input = getIn(state, ['inputs', name]);

    const newValue = (value === '' && input.initialValue === undefined) ? undefined : value;
    const errors = validateInput(input, newValue, getAllValues(getIn(state, 'inputs')));
    const valid = !errors || errors.length === 0;

    return mergeIn(state, ['inputs', name], {
        valid,
        errors: errors.length > 0 ? errors : null,
        pristine: false,
        dirty: true,
        touched: touch ? true : input.touched,
        value: newValue,
        asyncErrors: []
    });
}

function handleInputBlur(state, touch, name) {
    const input = getIn(state, ['inputs', name]);

    let valid = input.valid;
    let errors = input.errors || [];

    if(touch) {
        errors = validateInput(input, input.value, getAllValues(getIn(state, 'inputs')));
        valid = errors.length === 0;
    }

    return mergeIn(state, ['inputs', name], {
        valid,
        errors: errors.length > 0 ? errors : null,
        touched: touch ? true : input.touched
    });
}

function handleFormChange(state) {
    let valid = true;
    let pristine = true;
    let touched = false;

    for(const key in state.inputs) {
        if(Object.prototype.hasOwnProperty.call(state.inputs, key)) {
            const input = state.inputs[key];

            if(!input.valid) {
                valid = false;
            }
            if(!input.pristine) {
                pristine = false;
            }
            if(input.touched) {
                touched = true;
            }
        }
    }

    return mergeIn(state, {
        valid,
        pristine,
        touched
    });
}

function handleSubmitSuccess(state) {
    // In case form is already removed
    if(!state) {
        return state;
    }

    return mergeIn(state, {
        submitting: false,
        submitted: true,
        submitSuccess: true,
        valid: true,
        submitError: null
    });
}

function handleSubmitError(state, error) {
    state = mergeIn(state, {
        submitting: false,
        submitted: true,
        submitSuccess: false,
        submitError: error
    });

    if(error && error.inputs) {
        for(const key in error.inputs) {
            if(Object.prototype.hasOwnProperty.call(error.inputs, key)) {
                if(getIn(state, ['inputs', key])) {
                    let asyncErrors = error.inputs[key];

                    if(Object.prototype.toString.call(asyncErrors) !== '[object Array]') {
                        asyncErrors = [asyncErrors];
                    }

                    state = setIn(state, ['inputs', key, 'asyncErrors'], asyncErrors);
                }
            }
        }
    }

    return state;
}

function handleAsyncValidateStart(state, name) {
    let newState = setIn(state, 'asyncValidation', true);

    if(name) {
       newState = setIn(newState, ['inputs', name, 'asyncValidation'], true);
    }

    return newState;
}

function handleAsyncValidateFinished(state, name, errors) {
    let newState = setIn(state, 'asyncValidation', false);

    if(errors) {
        if(name) {
            errors = {
                [name]: errors[name]
            };
        }

        for(const key in errors) {
            if(Object.prototype.hasOwnProperty.call(errors, key) && getIn(newState, ['inputs', key])) {
                let inputErrors = errors[key];
                if(inputErrors) {
                    if(typeof inputErrors === 'string') {
                        inputErrors = [inputErrors];
                    }
                    if(Object.prototype.toString.call(inputErrors) !== '[object Array]') {
                        throw new Error(`Errors should be of type string or array. ${typeof inputErrors} was given`);
                    }
                }
                else {
                    inputErrors = [];
                }

                newState = mergeIn(newState, ['inputs', key], {
                    asyncValidation: false,
                    asyncErrors: inputErrors,
                    valid: inputErrors.length !== 0 ? false : getIn(newState, ['inputs', key, 'valid'])
                });
            }

        }
    }

    return newState;
}

const reducer = (state, action) => {
    switch(action.type) {
        case constants.REGISTER_INPUT:
            return handleFormChange(registerInput(state, action.payload.name, action.payload.config, action.payload.initialValue, action.payload.initialErrors));

        case constants.INPUT_CHANGE:
            return handleFormChange(handleInputChange(state, action.meta.touch, action.meta.name, action.payload.value));

        case constants.INPUT_BLUR:
            return handleFormChange(handleInputBlur(state, action.meta.touch, action.meta.name));

        case constants.SUBMITTING:
            return mergeIn(state, {
                submitting: true,
                submitError: null
            });

        case constants.SUBMIT_SUCCESS:
            return handleSubmitSuccess(state);

        case constants.SUBMIT_ERROR:
            return handleSubmitError(state, action.payload);

        case constants.ASYNC_VALIDATE_START:
            return handleAsyncValidateStart(state, action.meta.name);

        case constants.ASYNC_VALIDATE_FINISHED:
            return handleFormChange(handleAsyncValidateFinished(state, action.meta.name, action.payload));

        default:
            return state;
    }
};

const commonReducer = (state, action) => {
    switch(action.type) {
        case constants.REGISTER_FORM:
            return registerForm(state, action.meta.form, action.payload);

        case constants.REMOVE_FORM:
            if(action.meta && action.meta.form) {
                return removeForm(state, action.meta.form);
            }
            else {
                return state;
            }
            break;

        default:
            return state;
    }
};

const byForm = reducer => (state = {}, action = {}) => {
    const form = action && action.meta && action.meta.form;
    if (!form || !isMRFAction(action)) {
        return state
    }

    const formState = state[form];

    if(!formState) {
        return state;
    }

    const result = reducer(formState, action);

    return result === formState ? state : setIn(state, form, result);
};

export default reducerUtils.composeReducers(byForm(reducer), commonReducer);
import reducerUtils from './utils/reducerUtils';
import getFormValues from './utils/getFormValues';
import constants, {prefix} from './constants';
import getIn from '@mzvonar/getin';
import setIn from '@mzvonar/setin';
import mergeIn from '@mzvonar/mergein';
import {validateInput} from './validators';
import getPath from "./utils/getPath";

const isMRFAction = action => (
    action &&
    action.type &&
    action.type.length > prefix.length &&
    action.type.substring(0, prefix.length) === prefix
);

const createEmptyInputState = (name, config, initialValue, initialErrors) => {
    let validate = config.validate || [];

    const validateType = Object.prototype.toString.call(validate);
    if(validateType === '[object Function]') {
        validate = [validate];
    }
    else if(validateType !== '[object Array]') {
        throw new Error(`Validate prop must be either Array or function. ${typeof validate} provided`);
    }

    const state = {
        name: name,
        isArray: Boolean(config.isArray),
        pristine: true,
        dirty: false,
        touched: false,
        valid: true,
        errors: null,
        validate: validate,
        asyncValidation: false,
        asyncErrors: [],
        initialErrors: initialErrors && (Object.keys(initialErrors).length > 0 ? initialErrors : null)
    };

    if(!config.isArray) {
        state.value= typeof initialValue !== 'undefined' ? initialValue : config.value;
    }

    if(config.isArray) {
        state.items = initialValue || [];

        // if(initialValue && initialValue.length > 0) {
        //     for(let i = 0, length = initialValue.length; i < length; i += 1) {
        //         state.items.push(`${name}[${i}]`);
        //     }
        // }
    }

    if(config.required === true) {
        state.validate.unshift('required');
    }

    return state;
};

const createEmptyFormState = (state) => Object.assign({
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
    submitError: false,
    submitErrorMessages: null
}, state);

function registerForm(state, form, config = {}) {
    return setIn(state, [form], createEmptyFormState({
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
        /* istanbul ignore else */
        if(Object.prototype.hasOwnProperty.call(inputs, key)) {
            values[key] = inputs[key].value;
        }
    }

    return values;
}

function registerInput(state, name, config, initialValue, initialErrors) {
    if(!config.isArray) {
        const path = getPath(name);

        if(path.length > 1) {
            for(let i = 0, length = path.length; i < length; i += 1) {
                if(typeof path[i] === 'number') {
                    const array = getIn(state, ['inputs', ...path.slice(0, i)]);

                    if(array) {
                        const itemValue = getIn(array, ['items', ...path.slice(i)]);

                        initialValue = itemValue;
                    }

                    break;
                }
            }
        }
    }

    const input = getIn(state, ['inputs', name], createEmptyInputState(name, config, initialValue, initialErrors));
    const errors = validateInput(input, input.isArray ? initialValue : input.value, getFormValues(state));

    input.errors = errors.length > 0 ? errors : null;
    input.valid = !errors || errors.length === 0;

    return setIn(state, ['inputs', name], input);
}

function validateArrayInputs(state, name) {
    const nameRegex = new RegExp(`${name}\\[\\d+\\]`);

    let valid = true;
    for(const key in state.inputs) {
        if(Object.prototype.hasOwnProperty.call(state.inputs, key)) {
            if(key.match(nameRegex)) {
                if(!state.inputs[key].valid) {
                    valid = false;
                    break;
                }
            }
        }
    }

    return valid;
}

function checkArrayChange(state, touch, inputName) {
    const path = getPath(inputName);

    if(path.length > 1) {
        for(let i = path.length - 2; i >= 0; i -= 1) {
            if(typeof path[i] === 'number') {
                const arrayNamePath = path.slice(0, i);

                const input = getIn(state, ['inputs', ...arrayNamePath]);

                if(input && input.isArray) {
                    const allValues = getFormValues(state);
                    const value = getIn(allValues, arrayNamePath);

                    const errors = validateInput(input, value, allValues);
                    let valid = (!errors || errors.length === 0) && validateArrayInputs(state, arrayNamePath.join(''));

                    // const nameRegex = new RegExp(`${arrayNamePath.join('')}\\[\\d+\\]`);
                    //
                    // for(const key in state.inputs) {
                    //     if(Object.prototype.hasOwnProperty.call(state.inputs, key)) {
                    //         if(key.match(nameRegex)) {
                    //             if(!state.inputs[key].valid) {
                    //                 valid = false;
                    //                 break;
                    //             }
                    //         }
                    //     }
                    // }

                    state = mergeIn(state, ['inputs', ...arrayNamePath], {
                        valid,
                        errors: errors.length > 0 ? errors : null,
                        pristine: false,
                        dirty: true,
                        touched: touch ? true : input.touched,
                        asyncErrors: []
                    });
                }
            }
        }
    }

    return state;
}



// TODO: remove input cant remove input from state, it has to only mark it as disabled

function handleInputChange(state, touch, name, value) {
    const input = getIn(state, ['inputs', name]);

    let newValue;

    if(input.isArray) {
        newValue = getIn(getFormValues(state), getPath(name));
    }
    else {
        newValue = (value === '' && input.initialValue === undefined) ? undefined : value;
    }

    const errors = validateInput(input, newValue, getFormValues(state));
    const valid = !errors || errors.length === 0;

    let newState = mergeIn(state, ['inputs', name], {
        valid,
        errors: errors.length > 0 ? errors : null,
        pristine: false,
        dirty: true,
        touched: touch ? true : input.touched,
        value: input.isArray ? undefined : newValue,
        asyncErrors: []
    });

    newState = checkArrayChange(newState, touch, name);

    return newState;
}

function handleInputBlur(state, touch, name) {
    const input = getIn(state, ['inputs', name]);

    let valid = input.valid;
    let errors = input.errors || [];

    if(touch) {
        errors = validateInput(input, input.value, getFormValues(state));
        valid = errors.length === 0;
    }

    let newState = mergeIn(state, ['inputs', name], {
        valid,
        errors: errors.length > 0 ? errors : null,
        touched: touch ? true : input.touched
    });

    if(touch) {
        newState = checkArrayChange(newState, touch, name);
    }


    return newState;
}

function handleArrayChange(state, name) {
    const nameRegex = new RegExp(`^${name}\\[(\\d+)\\]`);

    const array = getIn(state, ['inputs', name]);
    const arrayPath = getPath(name);

    for(const key in state.inputs) {
        if(Object.prototype.hasOwnProperty.call(state.inputs, key)) {
            const match = key.match(nameRegex);
            if(match) {
                const input = state.inputs[key];
                const itemPath = getPath(input.name).slice(arrayPath.length);
                const itemValue = getIn(array, ['items', ...itemPath]);

                state = setIn(state, ['inputs', input.name, 'value'], itemValue);
            }
        }
    }

    return state;
}

function handleFormChange(state, validate) {
    let formValid = true;
    let pristine = true;
    let touched = false;

    for(const key in state.inputs) {
        /* istanbul ignore else */
        if(Object.prototype.hasOwnProperty.call(state.inputs, key)) {
            const input = state.inputs[key];

            let valid;
            if(validate) {
                const allValues = getFormValues(state);
                const value = input.isArray ? getIn(allValues, getPath(key)) : input.value;
                const errors = validateInput(input, value, allValues);
                valid = errors.length === 0;

                if(valid && input.isArray) {
                    valid = validateArrayInputs(state, key);
                }

                state = mergeIn(state, ['inputs', key], {
                    valid: valid,
                    errors: errors.length > 0 ? errors : null,
                });
            }
            else {
                valid = input.valid;
            }


            if(!valid) {
                formValid = false;
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
        valid: formValid,
        pristine,
        touched
    });
}

function handleSubmitSuccess(state) {
    // In case form is already removed
    /* istanbul ignore else */
    //if(!state) {
    //    return state;
    //}

    return mergeIn(state, {
        submitting: false,
        submitted: true,
        submitSuccess: true,
        valid: true,
        submitError: false,
        submitErrorObject: null
    });
}

function handleSubmitError(state, error) {
    let errorMessages = null;

    const errorType = Object.prototype.toString.call(error);
    if(errorType === '[object String]') {
        errorMessages = [error];
    }
    else if(errorType === '[object Array]') {
        errorMessages = error;
    }

    let formValid = state.valid;
    if(error && error.inputs) {
        for(const key in error.inputs) {
            /* istanbul ignore else */
            if(Object.prototype.hasOwnProperty.call(error.inputs, key)) {
                /* istanbul ignore else */
                if(getIn(state, ['inputs', key])) {
                    let asyncErrors = error.inputs[key];
                    formValid = false;

                    /* istanbul ignore else */
                    if(Object.prototype.toString.call(asyncErrors) !== '[object Array]') {
                        asyncErrors = [asyncErrors];
                    }

                    state = mergeIn(state, ['inputs', key], {
                        asyncErrors: asyncErrors,
                        valid: false
                    });
                }
            }
        }
    }

    state = mergeIn(state, {
        submitting: false,
        submitted: true,
        submitSuccess: false,
        submitError: true,
        submitErrorMessages: errorMessages,
        valid: formValid
    });

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
            /* istanbul ignore else */
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

function arrayPush(state, name, value) {
    const input = getIn(state, ['inputs', name]);

    if(!input || !input.isArray) {
        throw new Error(`Array ${name} doesn't exist`);
    }



    return setIn(state, ['inputs', name, 'items'], value, true);
}

function arrayPop(state, name) {
    const input = getIn(state, ['inputs', name]);

    if(!input || !input.isArray) {
        throw new Error(`Array ${name} doesn't exist`);
    }

    const items = [].concat(input.items);
    items.pop();

    return setIn(state, ['inputs', name, 'items'], items);
}

function arrayShift(state, name) {
    const input = getIn(state, ['inputs', name]);

    if(!input || !input.isArray) {
        throw new Error(`Array ${name} doesn't exist`);
    }

    const items = [].concat(input.items);
    items.shift();

    return setIn(state, ['inputs', name, 'items'], items);
}

function arrayUnshift(state, name, value) {
    const input = getIn(state, ['inputs', name]);

    if(!input || !input.isArray) {
        throw new Error(`Array ${name} doesn't exist`);
    }

    const items = [].concat(input.items);
    items.unshift(value);

    return setIn(state, ['inputs', name, 'items'], items);
}

const reducer = (state, action) => {
    switch(action.type) {
        case constants.REGISTER_INPUT:
            return handleFormChange(registerInput(state, action.payload.name, action.payload.config, action.payload.initialValue, action.payload.initialErrors));

        case constants.INPUT_CHANGE:
            return handleFormChange(handleInputChange(state, action.meta.touch, action.meta.name, action.payload.value), action.meta.touch || !getIn(state, ['inputs', action.meta.name, 'valid']));

        case constants.INPUT_BLUR:
            return handleFormChange(handleInputBlur(state, action.meta.touch, action.meta.name), true);

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

        case constants.ARRAY_PUSH:
            return handleFormChange(arrayPush(state, action.meta.name, action.payload.value));

        case constants.ARRAY_POP:
            return handleFormChange(arrayPop(state, action.meta.name));

        case constants.ARRAY_SHIFT:
            return handleFormChange(arrayShift(state, action.meta.name));

        case constants.ARRAY_UNSHIFT:
            return handleFormChange(handleArrayChange(arrayUnshift(state, action.meta.name, action.payload.value), action.meta.name));

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
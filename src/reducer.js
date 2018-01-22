import reducerUtils from './utils/reducerUtils';
import constants, {prefix} from './constants';
import getIn from '@mzvonar/getin';
import setIn from '@mzvonar/setin';
import mergeIn from '@mzvonar/mergein';
import {validateInput} from './validators';
import getPath from "./utils/getPath";
import isEvent from './utils/isEvent';

function checkEventAsValue(value, name, message) {
    if(isEvent(value)) {
        if(!message) {
            message = `It looks like you're trying to set an Event object as value to "${name}". Value: `;
        }
        console.warn(message, value);
    }
}

const isMRFAction = action => (
    action &&
    action.type &&
    action.type.length > prefix.length &&
    action.type.substring(0, prefix.length) === prefix
);

const createEmptyInputState = (name, config, initialErrors) => {
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
    values: {},
    initialValues: {},
    initialFormErrors: null,
    initialInputErrors: null,
    submitError: false,
    submitErrorMessages: null
}, state);

function registerForm(state, form, config = {}) {
    return setIn(state, [form], createEmptyFormState({
        values: config.initialValues || {},
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

function getValue(state, name) {
    return getIn(state, ['values', ...getPath(name)]);
}

function setValue(state, name, value) {
    const path = getPath(name);

    checkEventAsValue(value, name);

    for(let i = 0, length = path.length; i < length; i += 1) {
        if(typeof path[i] === 'number') {
            const arrayPath = path.slice(0, i);

            if(!getIn(state, ['values', ...arrayPath])) {
                state = setIn(state, ['values', ...arrayPath], []);
            }
        }
    }

    return setIn(state, ['values', ...path], value);
}

function registerInput(state, name, config, initialErrors) {
    const input = getIn(state, ['inputs', name], createEmptyInputState(name, config, initialErrors));
    const errors = validateInput(input, getValue(state, name), state.values);

    input.errors = errors.length > 0 ? errors : null;
    input.valid = !errors || errors.length === 0;

    return setIn(state, ['inputs', name], input);
}

function removeInput(state, name, removeValue) {
    const inputs = Object.assign({}, state.inputs);

    delete inputs[name];

    state = setIn(state, ['inputs'], inputs);

    if(removeValue) {
        state = setIn(state, ['values', ...getPath(name)], undefined);
    }

    return state;
}

function validateArrayInputs(state, name) {
    const nameRegex = new RegExp(`^${name}\\[\\d+\\]`);

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
        for(let i = path.length; i >= 0; i -= 1) {
            if(typeof path[i] === 'number') {
                const arrayNamePath = path.slice(0, i);
                const arrayName = arrayNamePath.join('');

                const input = getIn(state, ['inputs', ...arrayNamePath]);

                if(input && input.isArray) {
                    const allValues = getIn(state, 'values');
                    const value = getValue(state, arrayName);

                    const errors = validateInput(input, value, allValues);
                    let valid = (!errors || errors.length === 0) && validateArrayInputs(state, arrayName);

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

    const errors = validateInput(input, value, state.values);
    const valid = !errors || errors.length === 0;

    let newState = mergeIn(state, ['inputs', name], {
        valid,
        errors: errors.length > 0 ? errors : null,
        pristine: false,
        dirty: true,
        touched: touch ? true : input.touched,
        asyncErrors: []
    });

    newState = checkArrayChange(newState, touch, name);

    if(!input.isArray) {
        newState = setValue(newState, name, value);
    }

    return newState;
}

function handleInputBlur(state, touch, name) {
    const input = getIn(state, ['inputs', name]);

    let valid = input.valid;
    let errors = input.errors || [];

    if(touch) {
        errors = validateInput(input, getValue(state, name), getIn(state, 'values'));
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
                const allValues = getIn(state, 'values');
                const value = getValue(state, key);
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

    checkEventAsValue(value, name, `It looks like you're trying to push an Event object to "${name}" array. Value: `);

    const items = [].concat(getValue(state, name));
    items.push(value);

    return setValue(state, name, items);
}

function arrayPop(state, name) {
    const input = getIn(state, ['inputs', name]);

    if(!input || !input.isArray) {
        throw new Error(`Array ${name} doesn't exist`);
    }

    const items = [].concat(getValue(state, name));
    items.pop();

    return setValue(state, name, items);
}

function arrayShift(state, name) {
    const input = getIn(state, ['inputs', name]);

    if(!input || !input.isArray) {
        throw new Error(`Array ${name} doesn't exist`);
    }

    const items = [].concat(getValue(state, name));
    items.shift();

    return setValue(state, name, items);
}

function arrayUnshift(state, name, value) {
    const input = getIn(state, ['inputs', name]);

    if(!input || !input.isArray) {
        throw new Error(`Array ${name} doesn't exist`);
    }

    checkEventAsValue(value, name, `It looks like you're trying to unshift an Event object to "${name}" array. Value: `);

    const items = [].concat(getValue(state, name));
    items.unshift(value);

    return setValue(state, name, items);
}

function arrayInsert(state, name, index, value) {
    const input = getIn(state, ['inputs', name]);

    if(!input || !input.isArray) {
        throw new Error(`Array ${name} doesn't exist`);
    }

    if(index < 0) {
        throw new Error('index can\'t be lower than 0');
    }

    checkEventAsValue(value, name, `It looks like you're trying to insert an Event object to "${name}" array. Value: `);

    const items = [].concat(getValue(state, name));

    if(index > items.length) {
        index = items.length;
    }

    items.splice(index, 0, value);

    return setValue(state, name, items);
}

function arrayRemove(state, name, index) {
    const input = getIn(state, ['inputs', name]);

    if(!input || !input.isArray) {
        throw new Error(`Array ${name} doesn't exist`);
    }

    if(index < 0) {
        throw new Error('index can\'t be lower than 0');
    }

    const items = [].concat(getValue(state, name));

    if(index >= items.length) {
        throw new Error(`Index ${index} doesn't exist in Array ${name}`);
    }

    items.splice(index, 1);

    return setValue(state, name, items);
}

function arrayRemoveAll(state, name) {
    const input = getIn(state, ['inputs', name]);

    if(!input || !input.isArray) {
        throw new Error(`Array ${name} doesn't exist`);
    }

    return setValue(state, name, []);
}

const reducer = (state, action) => {
    switch(action.type) {
        case constants.REGISTER_INPUT:
            return handleFormChange(registerInput(state, action.payload.name, action.payload.config, action.payload.initialErrors));

        case constants.REMOVE_INPUT:
            return handleFormChange(removeInput(state, action.payload.name));

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
            return handleFormChange(arrayPush(state, action.meta.name, action.payload.value), true);

        case constants.ARRAY_POP:
            return handleFormChange(arrayPop(state, action.meta.name), true);

        case constants.ARRAY_SHIFT:
            return handleFormChange(arrayShift(state, action.meta.name), true);

        case constants.ARRAY_UNSHIFT:
            return handleFormChange(arrayUnshift(state, action.meta.name, action.payload.value), true);

        case constants.ARRAY_INSERT:
            return handleFormChange(arrayInsert(state, action.meta.name, action.payload.index, action.payload.value), true);

        case constants.ARRAY_REMOVE:
            return handleFormChange(arrayRemove(state, action.meta.name, action.payload.index), true);

        case constants.ARRAY_REMOVE_ALL:
            return handleFormChange(arrayRemoveAll(state, action.meta.name), true);

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
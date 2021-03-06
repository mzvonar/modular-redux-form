import constant from './../constants';

export default {
    registerForm: (form, config) => ({
        type: constant.REGISTER_FORM,
        meta: {
            form
        },
        payload: config
    }),
    removeForm: (form) => ({
        type: constant.REMOVE_FORM,
        meta: {
            form
        }
    }),
    registerInput: (form, name, config, initialValue, initialErrors) => ({
        type: constant.REGISTER_INPUT,
        meta: {
            form
        },
        payload: {
            name,
            config,
            initialValue,
            initialErrors
        }
    }),
    removeInput: (form, name) => ({
        type: constant.REMOVE_INPUT,
        meta: {
            form
        },
        payload: {
            name
        }
    }),
    inputChange: (form, touch, name, value) => ({
        type: constant.INPUT_CHANGE,
        meta: {
            form,
            name,
            touch
        },
        payload: {
            value
        }
    }),
    inputBlur: (form, touch, name) => ({
        type: constant.INPUT_BLUR,
        meta: {
            form,
            name,
            touch
        }
    }),
    submitting: (form) => ({
        type: constant.SUBMITTING,
        meta: {
            form
        }
    }),
    submitSuccess: (form) => ({
        type: constant.SUBMIT_SUCCESS,
        meta: {
            form
        }
    }),
    submitError: (form, error) => ({
        type: constant.SUBMIT_ERROR,
        meta: {
            form
        },
        payload: error
    }),
    asyncValidateStart: (form, name) => ({
        type: constant.ASYNC_VALIDATE_START,
        meta: {
            form,
            name
        }
    }),
    asyncValidateFinished: (form, name, errors) => ({
        type: constant.ASYNC_VALIDATE_FINISHED,
        meta: {
            form,
            name
        },
        payload: errors
    }),
    arrayPush: (form, name, value) => ({
        type: constant.ARRAY_PUSH,
        meta: {
            form,
            name
        },
        payload: {
            value
        }
    }),
    arrayPop: (form, name) => ({
        type: constant.ARRAY_POP,
        meta: {
            form,
            name
        }
    }),
    arrayShift: (form, name) => ({
        type: constant.ARRAY_SHIFT,
        meta: {
            form,
            name
        }
    }),
    arrayUnshift: (form, name, value) => ({
        type: constant.ARRAY_UNSHIFT,
        meta: {
            form,
            name
        },
        payload: {
            value
        }
    }),
    arrayInsert: (form, name, index, value) => ({
        type: constant.ARRAY_INSERT,
        meta: {
            form,
            name
        },
        payload: {
            index,
            value
        }
    }),
    arrayRemove: (form, name, index) => ({
        type: constant.ARRAY_REMOVE,
        meta: {
            form,
            name
        },
        payload: {
            index
        }
    }),
    arrayRemoveAll: (form, name) => ({
        type: constant.ARRAY_REMOVE_ALL,
        meta: {
            form,
            name
        }
    }),
};
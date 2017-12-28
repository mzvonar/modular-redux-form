import reducer from './../reducer';
import constants from './../constants';

jest.unmock('@mzvonar/getin');
jest.unmock('@mzvonar/setin');
jest.unmock('@mzvonar/mergein');
jest.unmock('./../utils/reducerUtils');
jest.unmock('./../validators');
jest.unmock('./../reducer');

describe('reducer', () => {
    it('should not change state for unknown action', () => {
        const oldState = {};

        const newState = reducer(oldState, {
            type: 'UNKNOWN_ACTION',
            payload: {}
        });

        expect(oldState).toBe(newState);
    });

    it('should not change state if action.meta is undefined', () => {
        const oldState = {
            testForm: {}
        };

        const newState = reducer(oldState, {
            type: constants.REGISTER_INPUT,
            payload: {}
        });

        expect(oldState).toBe(newState);
    });

    it('should not change state if action.meta.form is undefined', () => {
        const oldState = {
            testForm: {}
        };

        const newState = reducer(oldState, {
            type: constants.REGISTER_INPUT,
            payload: {},
            meta: {}
        });

        expect(oldState).toBe(newState);
    });

    describe('REGISTER_FORM', () => {
        it('should not mutate state', () => {
            const oldState = {};

            const newState = reducer(oldState, {
                type: constants.REGISTER_FORM,
                payload: {},
                meta: {
                    form: 'testForm'
                }
            });

            expect(oldState).not.toBe(newState);
        });

        it('should create empty form state', () => {
            const newState = reducer({}, {
                type: constants.REGISTER_FORM,
                payload: {},
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm).toEqual({
                pristine: true,
                valid: true,
                touched: false,
                submitting: false,
                submitted: false,
                submitSuccess: false,
                asyncValidation: null,
                initialValues: {},
                initialFormErrors: undefined,
                initialInputErrors: undefined,
                submitError: false,
                submitErrorMessages: null

            })
        });

        it('should set initial values', () => {
            const newState = reducer({}, {
                type: constants.REGISTER_FORM,
                payload: {
                    initialValues: {
                        field1: 'value1',
                        field2: 'value2'
                    }
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.initialValues).toEqual({
                field1: 'value1',
                field2: 'value2'
            });
        });

        it('should set initialFormErrors', () => {
            const newState = reducer({}, {
                type: constants.REGISTER_FORM,
                payload: {
                    initialFormErrors: ['error1', 'error2']
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.initialFormErrors).toEqual(['error1', 'error2']);
        });

        it('should set initialFormErrors if it is an empty array', () => {
            const newState = reducer({}, {
                type: constants.REGISTER_FORM,
                payload: {
                    initialFormErrors: []
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.initialFormErrors).toBeFalsy();
        });

        it('should set initialInputErrors', () => {
            const newState = reducer({}, {
                type: constants.REGISTER_FORM,
                payload: {
                    initialInputErrors: ['error1', 'error2']
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.initialInputErrors).toEqual(['error1', 'error2']);
        });
    });

    describe('REMOVE_FORM', () => {
        it('should not mutate state', () => {
            const oldState = {
                testInput: {
                    value: 'valium'
                }
            };

            const newState = reducer(oldState, {
                type: constants.REMOVE_FORM,
                meta: {
                    form: 'testForm'
                }
            });

            expect(oldState).not.toBe(newState);
        });

        it('should not change state if action.meta is undefined', () => {
            const oldState = {};

            const newState = reducer(oldState, {
                type: constants.REMOVE_FORM
            });

            expect(oldState).toBe(newState);
        });

        it('should not change state if action.meta.form is undefined', () => {
            const oldState = {};

            const newState = reducer(oldState, {
                type: constants.REMOVE_FORM,
                meta: {}
            });

            expect(oldState).toBe(newState);
        });

        it('should remove form from state', () => {
            const newState = reducer({
                testForm1: {
                    value: '1'
                },
                testForm2: {
                    value: '2'
                }
            }, {
                type: constants.REMOVE_FORM,
                meta: {
                    form: 'testForm1'
                }
            });

            expect(newState).toEqual({
                testForm2: {
                    value: '2'
                }
            });
        });
    });

    describe('REGISTER_INPUT', () => {
        it('should not mutate state', () => {
            const oldState = {
                testForm: {}
            };

            const newState = reducer(oldState, {
                type: constants.REGISTER_INPUT,
                payload: {
                    name: 'testInput',
                    config: {}
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(oldState).not.toBe(newState);
        });

        it('should create empty input state if not exists', () => {
            const newState = reducer({
                testForm: {}
            }, {
                type: constants.REGISTER_INPUT,
                payload: {
                    name: 'testInput',
                    config: {},
                    initialValue: 'initial value'
                },
                meta: {
                    form: 'testForm'
                }
            });
            
            expect(newState.testForm).toEqual({
                inputs: {
                    testInput: {
                        pristine: true,
                        dirty: false,
                        touched: false,
                        valid: true,
                        errors: null,
                        validate: [],
                        asyncValidation: false,
                        initialErrors: undefined,
                        asyncErrors: [],
                        value: 'initial value'
                    }
                },
                pristine: true,
                touched: false,
                valid: true
            });
        });

        it('should use existing state', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: 'some value',
                            validate: [],
                            pristine: true
                        }
                    }
                }
            }, {
                type: constants.REGISTER_INPUT,
                payload: {
                    name: 'testInput',
                    config: {},
                    initialValue: 'initial value'
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm).toEqual({
                inputs: {
                    testInput: {
                        errors: null,
                        valid: true,
                        value: 'some value',
                        validate: [],
                        pristine: true
                    }
                },
                pristine: true,
                touched: false,
                valid: true
            })
        });

        it('should add required validator if config.required is true', () => {
            const newState = reducer({
                testForm: {}
            }, {
                type: constants.REGISTER_INPUT,
                payload: {
                    name: 'testInput',
                    config: {
                        required: true
                    }
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.inputs.testInput.validate).toEqual(['required']);
        });

        it('should return invalid input if state has errors', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: undefined,
                            validate: ['required'],
                            pristine: true
                        }
                    }
                }
            }, {
                type: constants.REGISTER_INPUT,
                payload: {
                    name: 'testInput',
                    config: {},
                    initialValue: 'initial value'
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.inputs.testInput.valid).toBe(false);
            expect(newState.testForm.inputs.testInput.errors).toEqual(['required']);
            expect(newState.testForm.valid).toBe(false);
        });

        it('should return not pristine input and form', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            validate: [],
                            pristine: false
                        }
                    }
                }
            }, {
                type: constants.REGISTER_INPUT,
                payload: {
                    name: 'testInput',
                    config: {},
                    initialValue: 'initial value'
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.inputs.testInput.pristine).toBe(false);
            expect(newState.testForm.pristine).toBe(false);
        });

        it('should return touched input and form', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            validate: [],
                            touched: true
                        }
                    }
                }
            }, {
                type: constants.REGISTER_INPUT,
                payload: {
                    name: 'testInput',
                    config: {},
                    initialValue: 'initial value'
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.inputs.testInput.touched).toBe(true);
            expect(newState.testForm.touched).toBe(true);
        });

        it('should add initialErrors if not empty', () => {
            const newState = reducer({
                testForm: {}
            }, {
                type: constants.REGISTER_INPUT,
                payload: {
                    name: 'testInput',
                    config: {},
                    initialErrors: ['error']
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.inputs.testInput.initialErrors).toEqual(['error']);
        });

        it('should not add initialErrors if empty', () => {
            const newState = reducer({
                testForm: {}
            }, {
                type: constants.REGISTER_INPUT,
                payload: {
                    name: 'testInput',
                    config: {},
                    initialErrors: []
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.inputs.testInput.initialErrors).toBe(null);
        });
    });

    describe('INPUT_CHANGE', () => {
        it('should not mutate state', () => {
            const oldState = {
                testForm: {
                    inputs: {
                        testInput: {
                            validate: []
                        }
                    }
                }
            };

            const newState = reducer(oldState, {
                type: constants.INPUT_CHANGE,
                payload: {},
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(oldState).not.toBe(newState);
        });

        it('should set as undefined if value is empty string and input does not have initialValue', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: 'oldValue',
                            validate: []
                        }
                    }
                }
            }, {
                type: constants.INPUT_CHANGE,
                payload: {
                    value: ''
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.inputs.testInput.value).toBe(undefined);
        });

        it('should set value if it is empty string and input has initialValue', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: 'oldValue',
                            initialValue: 'something',
                            validate: []
                        }
                    }
                }
            }, {
                type: constants.INPUT_CHANGE,
                payload: {
                    value: ''
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.inputs.testInput.value).toBe('');
        });

        it('should set input as invalid if it has errors', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: null,
                            validate: ['required']
                        }
                    }
                }
            }, {
                type: constants.INPUT_CHANGE,
                payload: {
                    value: null
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.inputs.testInput.valid).toBe(false);
            expect(newState.testForm.inputs.testInput.errors).toEqual(['required']);
        });

        it('errors should be null if no errors were detected', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: null,
                            validate: ['required']
                        }
                    }
                }
            }, {
                type: constants.INPUT_CHANGE,
                payload: {
                    value: 'aaa'
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.inputs.testInput.valid).toBe(true);
            expect(newState.testForm.inputs.testInput.errors).toBe(null);
        });

        it('should set input as touched', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: null,
                            validate: []
                        }
                    }
                }
            }, {
                type: constants.INPUT_CHANGE,
                payload: {
                    value: 'aaa'
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput',
                    touch: true
                }
            });

            expect(newState.testForm.inputs.testInput.touched).toBe(true);
        });

        it('should set input as not touched', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: null,
                            validate: [],
                            touched: false
                        }
                    }
                }
            }, {
                type: constants.INPUT_CHANGE,
                payload: {
                    value: 'aaa'
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.inputs.testInput.touched).toBe(false);
        });

        it('should use touched property from previous state', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: null,
                            validate: [],
                            touched: true
                        }
                    }
                }
            }, {
                type: constants.INPUT_CHANGE,
                payload: {
                    value: 'aaa'
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.inputs.testInput.touched).toBe(true);
        });

        it('should set form as valid if all inputs are valid', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: null,
                            validate: ['required']
                        }
                    }
                }
            }, {
                type: constants.INPUT_CHANGE,
                payload: {
                    value: null
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.valid).toBe(false);
        });

        it('should set form as invalid if any input is invalid', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: null,
                            validate: ['required']
                        },
                        testInput2: {
                            value: null,
                            validate: []
                        }
                    }
                }
            }, {
                type: constants.INPUT_CHANGE,
                payload: {
                    value: null
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.valid).toBe(false);
        });

        it('should set form as not pristine if any input is not pristine', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: null,
                            validate: [],
                            pristine: true
                        },
                        testInput2: {
                            value: null,
                            validate: [],
                            pristine: true
                        }
                    }
                }
            }, {
                type: constants.INPUT_CHANGE,
                payload: {
                    value: null
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.pristine).toBe(false);
        });

        it('should set form as touched if any input is touched', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: null,
                            validate: ['required'],
                            touched: true
                        },
                        testInput2: {
                            value: null,
                            validate: ['required'],
                            touched: false
                        }
                    }
                }
            }, {
                type: constants.INPUT_CHANGE,
                payload: {
                    value: null
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.touched).toBe(true);
        });

        it('should set form as not touched if all inputs are untouched', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: null,
                            validate: ['required'],
                            touched: false
                        },
                        testInput2: {
                            value: null,
                            validate: [],
                            touched: false
                        }
                    }
                }
            }, {
                type: constants.INPUT_CHANGE,
                payload: {
                    value: null
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.touched).toBe(false);
        });
    });

    describe('INPUT_BLUR', () => {
        it('should not mutate state', () => {
            const oldState = {
                testForm: {
                    inputs: {
                        testInput: {
                            validate: []
                        }
                    }
                }
            };

            const newState = reducer(oldState, {
                type: constants.INPUT_BLUR,
                payload: {},
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(oldState).not.toBe(newState);
        });

        it('should not change anything', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            valid: true,
                            touched: false
                        }
                    }
                }
            }, {
                type: constants.INPUT_BLUR,
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.inputs.testInput).toEqual({
                valid: true,
                errors: null,
                touched: false
            });
        });

        it('should set touched to true', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            valid: true,
                            validate: [],
                            touched: false
                        }
                    }
                }
            }, {
                type: constants.INPUT_BLUR,
                meta: {
                    form: 'testForm',
                    name: 'testInput',
                    touch: true
                }
            });

            expect(newState.testForm.inputs.testInput.touched).toBe(true);
        });

        it('should be valid if no errors', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            valid: false,
                            validate: []
                        }
                    }
                }
            }, {
                type: constants.INPUT_BLUR,
                meta: {
                    form: 'testForm',
                    name: 'testInput',
                    touch: true
                }
            });

            expect(newState.testForm.inputs.testInput.valid).toBe(true);
            expect(newState.testForm.inputs.testInput.errors).toBe(null);
        });

        it('should be invalid if has errors', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            valid: false,
                            validate: ['required']
                        }
                    }
                }
            }, {
                type: constants.INPUT_BLUR,
                meta: {
                    form: 'testForm',
                    name: 'testInput',
                    touch: true
                }
            });

            expect(newState.testForm.inputs.testInput.valid).toBe(false);
            expect(newState.testForm.inputs.testInput.errors).toEqual(['required']);
        });


        it('should set form as valid if all inputs are valid', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: null,
                            validate: ['required']
                        }
                    }
                }
            }, {
                type: constants.INPUT_BLUR,
                payload: {
                    value: null
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.valid).toBe(false);
        });

        it('should set form as invalid if any input is invalid', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: null,
                            validate: ['required']
                        },
                        testInput2: {
                            value: null,
                            validate: []
                        }
                    }
                }
            }, {
                type: constants.INPUT_BLUR,
                payload: {
                    value: null
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.valid).toBe(false);
        });

        it('should set form as not pristine if any input is not pristine', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: null,
                            validate: [],
                            pristine: false
                        },
                        testInput2: {
                            value: null,
                            validate: [],
                            pristine: true
                        }
                    }
                }
            }, {
                type: constants.INPUT_BLUR,
                payload: {
                    value: null
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.pristine).toBe(false);
        });

        it('should set form as touched if any input is touched', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: null,
                            validate: ['required'],
                            touched: true
                        },
                        testInput2: {
                            value: null,
                            validate: ['required'],
                            touched: false
                        }
                    }
                }
            }, {
                type: constants.INPUT_BLUR,
                payload: {
                    value: null
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.touched).toBe(true);
        });

        it('should set form as not touched if all inputs are untouched', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            value: null,
                            validate: ['required'],
                            touched: false
                        },
                        testInput2: {
                            value: null,
                            validate: [],
                            touched: false
                        }
                    }
                }
            }, {
                type: constants.INPUT_BLUR,
                payload: {
                    value: null
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.touched).toBe(false);
        });
    });

    describe('SUBMITTING', () => {
        it('should not mutate state', () => {
            const oldState = {
                testForm: {}
            };

            const newState = reducer(oldState, {
                type: constants.SUBMITTING,
                meta: {
                    form: 'testForm'
                }
            });

            expect(oldState).not.toBe(newState);
        });

        it('should set state.submitting to true and state.submitError to null', () => {
            const newState = reducer({
                testForm: {
                    pristine: false,
                    initialValues: []
                }
            }, {
                type: constants.SUBMITTING,
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm).toEqual({
                pristine: false,
                initialValues: [],
                submitting: true,
                submitError: null
            });
        });
    });

    describe('SUBMIT_SUCCESS', () => {
        it('should not mutate state', () => {
            const oldState = {
                testForm: {}
            };

            const newState = reducer(oldState, {
                type: constants.SUBMIT_SUCCESS,
                meta: {
                    form: 'testForm'
                }
            });

            expect(oldState).not.toBe(newState);
        });

        it('should return proper state', () => {
            const newState = reducer({
                testForm: {
                    initialValues: 'some values'
                }
            }, {
                type: constants.SUBMIT_SUCCESS,
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm).toEqual({
                initialValues: 'some values',
                submitting: false,
                submitted: true,
                submitSuccess: true,
                valid: true,
                submitError: false,
                submitErrorObject: null
            })
        });
    });

    describe('SUBMIT_ERROR', () => {
        it('should not mutate state', () => {
            const oldState = {
                testForm: {}
            };

            const newState = reducer(oldState, {
                type: constants.SUBMIT_ERROR,
                payload: 'error',
                meta: {
                    form: 'testForm'
                }
            });

            expect(oldState).not.toBe(newState);
        });

        it('should return error state', () => {
            const newState = reducer({
                testForm: {
                    initialValues: 'some values'
                }
            }, {
                type: constants.SUBMIT_ERROR,
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm).toEqual({
                initialValues: 'some values',
                submitting: false,
                submitted: true,
                submitSuccess: false,
                submitError: true,
                submitErrorMessages: null,
                valid: true
            })
        });

        it('should put string payload to submitErrorMessages array', () => {
            const newState = reducer({
                testForm: {}
            }, {
                type: constants.SUBMIT_ERROR,
                payload: 'Big mistake',
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.submitErrorMessages).toEqual(['Big mistake']);
        });

        it('should put array payload to submitErrorMessages', () => {
            const newState = reducer({
                testForm: {}
            }, {
                type: constants.SUBMIT_ERROR,
                payload: ['error1', 'error2'],
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.submitErrorMessages).toEqual(['error1', 'error2']);
        });

        it('should set input as invalid if it has error in error.inputs object', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {}
                    }
                }
            }, {
                type: constants.SUBMIT_ERROR,
                payload: {
                    inputs: {
                        testInput: 'required'
                    }
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.inputs.testInput.valid).toBe(false);
            expect(newState.testForm.inputs.testInput.asyncErrors).toEqual(['required']);
            expect(newState.testForm.valid).toBe(false);
        });

        it('should set input as valid if it has no error in error.inputs object', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput: {
                            valid: true
                        }
                    }
                }
            }, {
                type: constants.SUBMIT_ERROR,
                payload: {
                    inputs: {
                        testInput2: 'required',
                        testInput3: 'required',
                    }
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.inputs.testInput.valid).toBe(true);
            expect(newState.testForm.inputs.testInput.asyncErrors).toBe(undefined);
            expect(newState.testForm.valid).toBe(true);
        });
    });

    describe('ASYNC_VALIDATE_START', () => {
        it('should not mutate state', () => {
            const oldState = {
                testForm: {}
            };

            const newState = reducer(oldState, {
                type: constants.ASYNC_VALIDATE_START,
                meta: {
                    form: 'testForm'
                }
            });

            expect(oldState).not.toBe(newState);
        });

        it('should set state.asyncValidation to true', () => {
            const oldState = {
                testForm: {}
            };

            const newState = reducer(oldState, {
                type: constants.ASYNC_VALIDATE_START,
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.asyncValidation).toBe(true);
        });

        it('should set input state.asyncValidation to true', () => {
            const oldState = {
                testForm: {
                    inputs: {
                        testInput: {}
                    }
                }
            };

            const newState = reducer(oldState, {
                type: constants.ASYNC_VALIDATE_START,
                meta: {
                    form: 'testForm',
                    name: 'testInput'
                }
            });

            expect(newState.testForm.inputs.testInput.asyncValidation).toBe(true);
        });
    });

    describe('ASYNC_VALIDATE_FINISHED', () => {
        it('should not mutate state', () => {
            const oldState = {
                testForm: {}
            };

            const newState = reducer(oldState, {
                type: constants.ASYNC_VALIDATE_FINISHED,
                meta: {
                    form: 'testForm'
                }
            });

            expect(oldState).not.toBe(newState);
        });

        it('should set state.asyncValidation to false', () => {
            const newState = reducer({
                testForm: {
                    asyncValidation: true
                }
            }, {
                type: constants.ASYNC_VALIDATE_FINISHED,
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.asyncValidation).toBe(false);
        });

        it('should set asyncErrors for every input that has error', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput1: {

                        },
                        testInput2: {

                        }
                    }
                }
            }, {
                type: constants.ASYNC_VALIDATE_FINISHED,
                payload: {
                    testInput1: 'error1',
                    testInput2: 'error2'
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm).toEqual({
                asyncValidation: false,
                pristine: false,
                touched: false,
                valid: false,
                inputs: {
                    testInput1: {
                        asyncValidation: false,
                        asyncErrors: ['error1'],
                        valid: false
                    },
                    testInput2: {
                        asyncValidation: false,
                        asyncErrors: ['error2'],
                        valid: false
                    }
                }
            });
        });

        it('should not set asyncErrors for inputs without error', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput1: {

                        },
                        testInput2: {

                        }
                    }
                }
            }, {
                type: constants.ASYNC_VALIDATE_FINISHED,
                payload: {
                    testInput1: 'error1'
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm).toEqual({
                asyncValidation: false,
                pristine: false,
                touched: false,
                valid: false,
                inputs: {
                    testInput1: {
                        asyncValidation: false,
                        asyncErrors: ['error1'],
                        valid: false
                    },
                    testInput2: {}
                }
            });
        });

        it('should not set asyncErrors only for specified input', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput1: {

                        },
                        testInput2: {

                        }
                    }
                }
            }, {
                type: constants.ASYNC_VALIDATE_FINISHED,
                payload: {
                    testInput1: 'error1',
                    testInput2: 'error2'
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput2'
                }
            });

            expect(newState.testForm).toEqual({
                asyncValidation: false,
                pristine: false,
                touched: false,
                valid: false,
                inputs: {
                    testInput1: {},
                    testInput2: {
                        asyncValidation: false,
                        asyncErrors: ['error2'],
                        valid: false
                    }
                }
            });
        });

        it('should set string error as array', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput1: {

                        }
                    }
                }
            }, {
                type: constants.ASYNC_VALIDATE_FINISHED,
                payload: {
                    testInput1: 'error1'
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.inputs.testInput1.asyncErrors).toEqual(['error1']);
        });

        it('should set array of errors', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput1: {

                        }
                    }
                }
            }, {
                type: constants.ASYNC_VALIDATE_FINISHED,
                payload: {
                    testInput1: ['error1', 'error2']
                },
                meta: {
                    form: 'testForm'
                }
            });

            expect(newState.testForm.inputs.testInput1.asyncErrors).toEqual(['error1', 'error2']);
        });

        it('should throw error if error is not string or array', () => {
            expect(() => {
                reducer({
                    testForm: {
                        inputs: {
                            testInput1: {

                            }
                        }
                    }
                }, {
                    type: constants.ASYNC_VALIDATE_FINISHED,
                    payload: {
                        testInput1: {
                            error1: true
                        }
                    },
                    meta: {
                        form: 'testForm'
                    }
                });
            }).toThrow('Errors should be of type string or array. object was given');
        });

        it('should set asyncErrors to empty array if no error for specified input', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput1: {

                        },
                        testInput2: {

                        }
                    }
                }
            }, {
                type: constants.ASYNC_VALIDATE_FINISHED,
                payload: {
                    testInput2: 'error1'
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput1'
                }
            });

            expect(newState.testForm.inputs.testInput1.asyncErrors).toEqual([]);
        });

        it('should set input as invalid if it has async errors', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput1: {
                            valid: true
                        }
                    }
                }
            }, {
                type: constants.ASYNC_VALIDATE_FINISHED,
                payload: {
                    testInput1: 'error1'
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput1'
                }
            });

            expect(newState.testForm.inputs.testInput1.valid).toBe(false);
        });

        it('should keep inputs validity if no async errors', () => {
            const newState = reducer({
                testForm: {
                    inputs: {
                        testInput1: {
                            valid: false
                        }
                    }
                }
            }, {
                type: constants.ASYNC_VALIDATE_FINISHED,
                payload: {
                    testInput2: 'error1'
                },
                meta: {
                    form: 'testForm',
                    name: 'testInput1'
                }
            });

            expect(newState.testForm.inputs.testInput1.valid).toBe(false);
        });
    });
});
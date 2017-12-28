// import Joi from 'joi-browser';
// import validators, {setGlobalValidators, validateInput} from './../validators';
// import constants from './../constants';
//
// jest.unmock('joi-browser');
// jest.unmock('./../validators');
//
// describe('validators', () => {
//     describe('setGlobalValidators', () => {
//         it('should add validators to global validators', () => {
//             const newValidators = {
//                 validator1: 'validate 1',
//                 validator2: 'validate 2'
//             };
//
//             setGlobalValidators(newValidators);
//
//             expect(validators.validator1).toBe('validate 1');
//             expect(validators.validator2).toBe('validate 2');
//         });
//
//         it('should throw an error if argument is not an object', () => {
//             expect(() => {
//                 setGlobalValidators(['validator1', 'validator2']);
//             }).toThrow(`Validators must be an object. [object Array] was provided.`);
//         });
//     });
//
//     describe('validateInput', () => {
//         let requiredSpy;
//
//         beforeAll(() => {
//            //setGlobalValidators({
//            //    returnTrue: () => true,
//            //    returnFalse: () => false
//            //});
//             requiredSpy = jest.spyOn(validators, 'required');
//         });
//         afterAll(() => {
//             requiredSpy.mockRestore();
//         });
//
//         afterEach(() => {
//             requiredSpy.mockReset();
//         });
//
//         it('should return no errors if validators are empty', () => {
//             const errors = validateInput({
//                 validate: []
//             }, undefined);
//
//             expect(errors).toEqual([]);
//         });
//
//         it('should throw an error if validator is not found', () => {
//             expect(() => {
//                 validateInput({
//                     validate: ['definitelyNotExistingValidator']
//                 }, undefined);
//             }).toThrow('No validator provided for "definitelyNotExistingValidator"');
//         });
//
//         it('should call validator with proper arguments', () => {
//             requiredSpy.mockImplementation(() => false);
//
//             validateInput({
//                 validate: ['required']
//             }, 'some value', 'allValues');
//
//             expect(requiredSpy.mock.calls[0][0]).toBe('some value');
//             expect(requiredSpy.mock.calls[0][1]).toBe('allValues');
//         });
//
//         it('should return empty errors if validators pass', () => {
//             requiredSpy.mockImplementation(() => true);
//
//             const errors = validateInput({
//                 validate: ['required']
//             }, 'value');
//
//             expect(errors.length).toBe(0);
//         });
//
//         it('should return errors if validators fail', () => {
//             requiredSpy.mockImplementation(() => false);
//
//             const errors = validateInput({
//                 validate: ['required']
//             });
//
//             expect(errors).toEqual(['required']);
//         });
//
//         it('should call function validator', () => {
//             const functionValidator = jest.fn(() => false);
//
//             setGlobalValidators({
//                 functionValidator
//             });
//
//             const errors = validateInput({
//                 validate: ['functionValidator']
//             }, 'value', 'all values');
//
//             expect(errors).toEqual(['functionValidator']);
//             expect(functionValidator).toBeCalledWith('value', 'all values');
//         });
//
//         it('should call Joi validator', () => {
//             setGlobalValidators({
//                 joiValidator: Joi.string().required()
//             });
//
//             const errors = validateInput({
//                 validate: ['joiValidator']
//             }, '');
//
//             expect(errors).toEqual(['joiValidator']);
//         });
//
//         it('should call Joi validator with context', () => {
//             // TODO: finish
//             const joiContextValidator = Joi.allow(Joi.ref('$some')).label('joiContextValidator');
//
//             const errors = validateInput({
//                 validate: [joiContextValidator]
//             }, 'get', {
//                 some: 'come'
//             });
//
//             expect(errors).toEqual(['joiContextValidator']);
//         });
//     });
//
//     describe('required', () => {
//         let required;
//
//         beforeAll(() => {
//             required = validators.required;
//         });
//
//         it('should return false for undefined', () => {
//             expect(required(undefined)).toBe(false);
//         });
//
//         it('should return false for false', () => {
//             expect(required(false)).toBe(false);
//         });
//
//         it('should return false for null', () => {
//             expect(required(null)).toBe(false);
//         });
//
//         it('should return false for an empty string', () => {
//             expect(required('')).toBe(false);
//         });
//
//         it('should return false for an empty array', () => {
//             expect(required([])).toBe(false);
//         });
//
//         it('should return true for true', () => {
//             expect(required(true)).toBe(true);
//         });
//
//         it('should return true for non empty string', () => {
//             expect(required('come get some')).toBe(true);
//         });
//
//         it('should return true for non empty array', () => {
//             expect(required(['ar ray'])).toBe(true);
//         });
//
//         it('should return true for object', () => {
//             expect(required({})).toBe(true);
//         });
//
//         it('should return true for number', () => {
//             expect(required(13)).toBe(true);
//         });
//
//         it('should return true for number 0', () => {
//             expect(required(0)).toBe(true);
//         });
//     });
// });
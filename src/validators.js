let Joi;
try {
    Joi = require('joi-browser');
} catch (er) {
    Joi = null;
}

const validators = {
    required: (newValue) => !!(newValue && ((typeof newValue !== 'string' && !Array.isArray(newValue)) || newValue.length !== 0)),
};

export function setGlobalValidators(newValidators) {
    if(Object.prototype.toString.call(newValidators) !== '[object Object]') {
        throw new Error(`Validators must be an object. ${Object.prototype.toString.call(newValidators)} was provided.`);
    }

    for(const key in newValidators) {
        if(Object.prototype.hasOwnProperty.call(newValidators, key)) {
            validators[key] = newValidators[key];
        }
    }
}

export function validateInput(input, value) {
    const errors = [];

    for(let i = 0, length = input.validate.length; i < length; i += 1) {
        const validationKey = input.validate[i];

        let validator;
        let validatorName;

        if(validationKey.isJoi) {
            if(!Joi) {
                throw new Error('Validator is Joi schema but Joi module was not found.');
            }

            validator = validationKey;
            validatorName = validator._getLabel();

            const result = Joi.validate(value, validator);

            if(!validatorName && process.env.NODE_ENV !== 'production') {
                console.warn('Unlabelled Joi schema.');
                validatorName = 'UnlabeledJoiSchema';
            }

            if(result.error) {
                errors.push(validatorName);
            }
        }
        else {
            if(Object.prototype.toString.call(validationKey) === '[object Function]') {
                validator = validationKey;
                validatorName = validator.name;
            }
            else {
                validator = validators[validationKey];
                validatorName = validationKey;
            }

            if(!validator) {
                throw new Error(`No validator provided for "${validationKey}"`);
            }

            if(validator.isJoi) {
                if(!Joi) {
                    throw new Error('Validator is Joi schema but Joi module was not found.');
                }

                const result = Joi.validate(value, validator);

                if(!validatorName && process.env.NODE_ENV !== 'production') {
                    console.warn('Unlabelled Joi schema.');
                    validatorName = 'UnlabeledJoiSchema';
                }

                if(result.error) {
                    errors.push(validatorName);
                }
            }
            else if(!validator(value)) {
                errors.push(validatorName);
            }
        }
    }

    return errors;
}

export default validators;
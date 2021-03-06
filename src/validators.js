import config from './config';

const validators = {
    required: (newValue) => !!( (newValue || newValue === 0) && ((typeof newValue !== 'string' && !Array.isArray(newValue)) || newValue.length !== 0)),
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

export function validateInput(input, value, allValues) {
    const errors = [];

    for(let i = 0, length = input.validate.length; i < length; i += 1) {
        const validationKey = input.validate[i];

        let validator;
        let validatorName;

        if(validationKey.isJoi) {
            if(!config.Joi) {
                throw new Error('Validator is Joi schema but Joi module was not found.');
            }

            validator = validationKey;
            validatorName = validator._getLabel();

            if(!validatorName && process.env.NODE_ENV !== 'production') {
                console.warn('Unlabelled Joi schema.');
                validatorName = 'UnlabeledJoiSchema';
            }

            let result;
            try {
                result = config.Joi.validate(value, validator, {
                    context: allValues
                });
            }
            catch(e) {
                console.error(e);

                result = {
                    error: true
                };
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
                if(!config.Joi) {
                    throw new Error('Validator is Joi schema but Joi module was not found.');
                }

                if(!validatorName && process.env.NODE_ENV !== 'production') {
                    console.warn('Unlabelled Joi schema.');
                    validatorName = 'UnlabeledJoiSchema';
                }

                let result;

                try {
                    result = config.Joi.validate(value, validator, {
                        context: allValues
                    });
                }
                catch(e) {
                    console.error(e);

                    result = {
                        error: true
                    };
                }

                if(result.error) {
                    errors.push(validatorName);
                }
            }
            else {
                let valid = false;

                try {
                    valid = validator(value, allValues)
                }
                catch(e) {
                    console.error(e);
                    valid = false;
                }

                if(!valid) {
                    errors.push(validatorName);
                }
            }
        }
    }

    return errors;
}

export default validators;
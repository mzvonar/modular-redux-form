import getIn from '@mzvonar/getin';
import {mutableSetIn} from '@mzvonar/setin';
import getPath from './getPath';

export default function getFormValues(formState) {
    const data = {};

    if(formState) {
        for(const key in formState.inputs) {
            if(Object.prototype.hasOwnProperty.call(formState.inputs, key)) {
                const path = getPath(key);
                const input = formState.inputs[key];

                if(!input.isArray) {
                    const currentPath = [];

                    for(let i = 0, length = path.length; i < length; i += 1) {
                        const pathPart = path[i];
                        const nextPart = path[i + 1];

                        currentPath.push(pathPart);

                        if(typeof nextPart === 'undefined') {
                            mutableSetIn(data, path, input.value);
                        }
                        else if(typeof getIn(data, currentPath) === 'undefined'){
                            if(typeof nextPart === 'number') {
                                mutableSetIn(data, currentPath, []);
                            }
                            else {
                                mutableSetIn(data, currentPath, {});
                            }
                        }
                    }
                }
            }
        }
    }

    return data;
}
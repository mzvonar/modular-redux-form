import connectForm, {propTypes} from './connectForm';
import Input from './components/Input';
import Array from './components/Array';
import reducer from './reducer';
import actions from './actions';
import {setGlobalValidators} from './validators';

const inputChange = (form, name, value) => actions.inputChange(form, true, name, value);
const formActions = {
    inputChange,
    arrayPush: actions.arrayPush,
    arrayPop: actions.arrayPop,
    arrayShift: actions.arrayShift,
    arrayUnshift: actions.arrayUnshift,
    arrayInsert: actions.arrayInsert,
    arrayRemove: actions.arrayRemove,
    arrayRemoveAll: actions.arrayRemoveAll
};

export {
    connectForm,
    propTypes,
    Input,
    Array,
    reducer,
    inputChange,
    formActions,
    setGlobalValidators
};
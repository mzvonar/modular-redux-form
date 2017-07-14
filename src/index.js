import connectForm, {propTypes} from './connectForm';
import Input from './components/Input';
import reducer from './reducer';
import actions from './actions';
import {setGlobalValidators} from './validators';

const inputChange = (form, name, value) => actions.inputChange(form, true, name, value);

export {
    connectForm,
    propTypes,
    Input,
    reducer,
    inputChange,
    setGlobalValidators
};
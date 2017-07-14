import connectForm from './connectForm';
import Input from './components/Input';
import reducer from './reducer';
import actions from './actions';
import {setGlobalValidators} from './validators';

const inputChange = (form, name, value) => actions.inputChange(form, true, name, value);

export {
    connectForm,
    Input,
    reducer,
    inputChange,
    setGlobalValidators
};
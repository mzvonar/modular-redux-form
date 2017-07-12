function createFilteredReducer(reducerFunction, reducerPredicate) {
    return (state, action) => {
        const isInitializationCall = state === undefined;
        const shouldRunWrappedReducer = reducerPredicate(action) || isInitializationCall;
        return shouldRunWrappedReducer ? reducerFunction(state, action) : state;
    }
}

function composeReducers(...funcs) {
    let initialState;
    if(Object.prototype.toString.call(funcs[funcs.length - 1]) !== '[object Function]') {
        initialState = funcs.pop();
    }

    return (state, action) => {
        const isInitializationCall = state === undefined;

        if(isInitializationCall) {
            state = initialState;
        }

        return funcs.reduce((state, reducer) => {
            let nextState = reducer(isInitializationCall ? initialState : state, action);

            if(state && nextState !== state) {
                let oldKeys;
                let newKeys;

                if(state && nextState) {
                    oldKeys = Object.keys(state);
                    newKeys = Object.keys(nextState);
                }

                nextState = Object.assign({}, state, nextState);

                if(newKeys) {
                    for(let i = 0, length = oldKeys.length; i < length; i += 1) {
                        if(newKeys.indexOf(oldKeys[i]) < 0) {
                            delete nextState[oldKeys[i]];
                        }
                    }
                }

            }

            return nextState;
        }, state);
    }
}

module.exports = {
    createFilteredReducer,
    composeReducers
};
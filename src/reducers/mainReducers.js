import {
    SET_TODOS,
    SET_USERS,
} from '../actions/mainActions';

const defaultState = {
    headers: [],
    todos: [],
    users: []
}

export const mainReducers = (state = defaultState, action) => {
    switch (action.type) {
        case SET_TODOS:
            if (action.todos) {
                return {
                    ...state,
                    todos: action.todos,
                    headers: [...new Set(action.todos.map(todo => todo.category))]
                }
            } else return state

        case SET_USERS:
            if (action.users) {
                return {
                    ...state,
                    users: action.users
                }
            }
        default:
            return state;
    }
}
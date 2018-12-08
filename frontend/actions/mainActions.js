export const SET_TODOS = "SET_TODOS";
export const SET_USERS = "SET_USERS";

export const setToDos = (todos) => {
    return {
        type: SET_TODOS,
        todos
    }
}

export const setUsers = (users) => {
    return {
        type: SET_USERS,
        users
    }
}
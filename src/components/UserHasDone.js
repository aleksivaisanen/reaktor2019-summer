import React, { Component } from 'react';
import { Table, Card, CardTitle, CardBody, Button, Alert, Dropdown, DropdownItem, DropdownToggle, DropdownMenu } from 'reactstrap';
import '../index.css';
import axios from 'axios';
import { connect } from 'react-redux'
import { setToDos, setUsers } from '../actions/mainActions'

class UserHasDone extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dropdownOpen: false,
            filteredTodos: [],
            filteredHeaders: [],
            activeUser: null,
            message: '',
            alertColor: "warning"
        };
    }
    componentDidMount = () => {
        axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    }

    toggle = () => {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    menuItemClick = (user) => {
        const todosFilter = this.props.todos.filter(todo => todo.hasDone.indexOf(user.username) !== -1);
        this.setState({
            activeUser: user,
            filteredTodos: todosFilter,
            filteredHeaders: [...new Set(todosFilter.map(todo => todo.category))]
        })
    }

    render() {
        const { message, alertColor } = this.state;
        return (
            <Card>
                {/*nothing is visible if user isn't admin */}
                {localStorage.getItem('role') === "admin" &&

                    <CardBody>
                        <CardTitle>Mitä käyttäjä on tehnyt?</CardTitle>

                        {message !== '' &&
                            <Alert color={alertColor}>
                                {message}
                            </Alert>
                        }
                        <Dropdown direction='down' isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                            <DropdownToggle color="primary" caret>
                                {this.state.activeUser ?
                                    this.state.activeUser.firstName + ' ' + this.state.activeUser.lastName + ' - ' + this.state.activeUser.username :
                                    "Valitse käyttäjä"}
                            </DropdownToggle>
                            <DropdownMenu>
                                {this.props.users ? this.props.users.map(user => {
                                    const name = user.firstName + ' ' + user.lastName
                                    return <DropdownItem onClick={() => this.menuItemClick(user)}>{name + ' - ' + user.username}</DropdownItem>
                                }) : <DropdownItem disabled />}

                            </DropdownMenu>
                        </Dropdown>
                        <br />

                        {this.state.activeUser && this.state.filteredHeaders.map(header =>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>{header}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.filteredTodos.filter(todo => todo.category === header).map(todo =>
                                        <tr>
                                            <td>{todo.name}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        )}
                    </CardBody>
                }
            </Card>
        )
    }
}

const mapStateToProps = (state) => {
    return ({
        headers: state.main.headers,
        todos: state.main.todos,
        users: state.main.users,
    })
}

const mapDispatchToProps = (dispatch) => {
    return ({
        setToDos: (todos) => dispatch(setToDos(todos)),
        setUsers: (users) => dispatch(setUsers(users)),
    })

}
export default connect(mapStateToProps, mapDispatchToProps)(UserHasDone);
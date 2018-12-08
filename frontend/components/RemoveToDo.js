import React, { Component } from 'react';
import { Table, Card, CardTitle, CardBody, Button, Alert, Form, FormGroup, Input, Dropdown, DropdownItem, DropdownToggle, DropdownMenu } from 'reactstrap';
import '../index.css';
import axios from 'axios';
import { connect } from 'react-redux'
import { setToDos, setUsers } from '../actions/mainActions'

class RemoveToDo extends Component {

    constructor() {
        super();
        this.state = {
            dropdownOpen: false,
            toDoToRemoveId: null,
            message: '',
            alertColor: "warning",
            defaultSelect: "selected"
        };
    }
    componentDidMount = () => {
        axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    }

    onChange = (e) => {
        //gets the dataId of the selected option child with the index
        const state = this.state
        const index = e.target.selectedIndex;
        const optionElement = e.target.options[index]
        const optionId = optionElement.getAttribute('dataId');
        state["toDoToRemoveId"] = optionId;
        state["alertColor"] = "warning";
        state["message"] = "";
        state["defaultSelect"] = "";
        this.setState(state);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const id = this.state.toDoToRemoveId
        if (id) {
            axios.post('/api/todo/remove', { id })
                .then(res => {
                    this.props.setToDos(res.data);
                    this.setState({
                        toDoToRemoveId: null,
                        message: "Tehtävä poistettu!",
                        alertColor: "success",
                        defaultSelect: "select"
                    });
                })
                .catch((error) => {
                    console.log(error)
                });
        } else {
            this.setState({
                message: "Valitse jokin arvo!",
                alertColor: "warning"
            })
        }
    }

    render() {
        const { message, alertColor } = this.state;
        return (
            <Card>
                {/*nothing is visible if user isn't admin */}
                {localStorage.getItem('role') === "admin" &&

                    <CardBody>
                        <CardTitle>Poista tehtävä</CardTitle>

                        {message !== '' &&
                            <Alert color={alertColor}>
                                {message}
                            </Alert>
                        }
                        <Form>
                            <FormGroup>
                                <Input type="select" name="toDoToRemove" id="exampleSelectMulti" onChange={this.onChange}>
                                    <option disabled="disabled" selected={this.state.defaultSelect}>Valitse tehtävä</option>
                                    {this.props.headers.map(head => {
                                        return (
                                            <optgroup label={head}>
                                                {this.props.todos.filter(todo => todo.category === head).map(todo => {
                                                    return (<option dataId={todo._id}>{todo.name}</option>)
                                                })}
                                            </optgroup>
                                        )
                                    })}
                                </Input>
                            </FormGroup>
                        </Form>
                        <Button lg color="primary" onClick={this.onSubmit}>Poista tehtävä</Button>
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
export default connect(mapStateToProps, mapDispatchToProps)(RemoveToDo);
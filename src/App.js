import React, { Component } from 'react';
import { Container, Card, CardBody, CardTitle, Progress, Table } from 'reactstrap'
import axios from 'axios';
import './index.css';


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {

      todos: [],
      headers: [],
    };
  }

  componentDidMount() {
    axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    axios.get('/api/todo')
      .then(res => {
        this.setState({
          todos: res.data,
          headers: [...new Set(res.data.map(todo => todo.category))]
        });
      })
      .catch((error) => {
        console.log(error)
      });
  }

  render() {
    return (
      <Container>
      </Container>
    );
  }
}

export default App;
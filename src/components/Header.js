import React, { Component } from 'react';
import { Container, Navbar, NavbarBrand, Nav, NavItem, NavbarToggler, Collapse } from 'reactstrap';
import { Link } from 'react-router-dom'
import '../index.css';

class Header extends Component {
    constructor(props) {
        super(props);

        this.state = {
            collapsed: true
        };
    }

    toggleNavbar = () => {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    render() {
        return (
            <div className="header">
                <Navbar dark color="primary" expand="md">
                    <Container>
                        <NavbarBrand>Reaktor 2019 Summer</NavbarBrand>
                        <NavbarToggler onClick={this.toggleNavbar} />
                        <Collapse isOpen={!this.state.collapsed} navbar>
                            <Nav className="ml-auto" navbar >
                                    <NavItem>
                                        <Link className="nav-link" to={`/`}>Etusivu</Link>
                                    </NavItem>
                            </Nav>
                        </Collapse>
                    </Container>
                </Navbar>
            </div>
        )
    }
}
export default Header;
import React, { Component } from 'react';
import { Container } from 'reactstrap';
import '../index.css';

class Footer extends Component {

    render() {
        return (
            <footer>
                <Container>
                    <p className="text-center"><a id="aleksilink" href="https://aleksivaisanen.github.io">Aleksi Väisänen design</a>
                        <br />
                        Reaktor 2019 Summer
                    </p>
                </Container>
            </footer>
        )
    }
}
export default Footer
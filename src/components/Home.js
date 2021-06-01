import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
`;

const Input = styled.input``;

const Display = styled.div`
    display: flex;
    width: 70%;
    flex-direction: row;
`;

const Text = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
`;

const Annotation = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
`;

const LetterContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 5px;
`;

export class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
        };
    }

    handleChange = (e) => {
        let phrase = e.target.value;
        let chars = phrase.split('');

        let allChinese = true;

        for (let i = 0; i < chars.length; i += 1) {
            if (chars[i].toLowerCase() !== chars[i].toUpperCase()) {
                allChinese = false;
                break;
            }
        }

        if (allChinese === true) {
            this.setState(
                {
                    value: e.target.value,
                },
                () => {
                    console.log(this.state.value);
                },
            );
        }
    };

    render() {
        const { value } = this.state;

        return (
            <Container>
                <Input type="text" onChange={this.handleChange} />
                <Display>
                    {value.split('').map((item, index) => {
                        return (
                            <LetterContainer key={index}>
                                <Annotation>hi</Annotation>
                                <Text>{item}</Text>
                            </LetterContainer>
                        );
                    })}
                </Display>
            </Container>
        );
    }
}

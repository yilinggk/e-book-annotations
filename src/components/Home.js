import React from 'react';
import styled from 'styled-components';
import { Trie } from './Trie.js'

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
            values: [
                {
                    pinyin: '',
                    cchar: ''
                }
            ],
        };
        let data = require('./data/data.json');
        console.log(data)


        this.trie = new Trie();
        this.dict = {};
        //todo: 多音字。

        data.forEach(entry => {
            this.trie.insert(entry["simplified"])
            this.dict[entry["simplified"]] = entry["pinyin"];
        });
        
        this.vowels = require('./data/vowels.json');
    }

    parsePinyin(pinyin) {
        console.log(pinyin)
        if(pinyin == undefined || pinyin == ""){
            return ""
        }

        let accent = pinyin[pinyin.length - 1];
        var word = pinyin.substr(0, pinyin.length - 1);
        for (var i = 0; i < pinyin.length; i++) {
            let char = pinyin[i].toLowerCase()
            if(char == "u" && pinyin[i+1] == ":"){
                char = 'u:'
            }

            if(this.vowels[char]){
                return word.replace(char, this.vowels[char][accent])
            }
        }
        return word
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

        // this.parsePinyin("san1")

        // if (allChinese === true) {
        this.setState(
            {
                values:
                    e.target.value.split('').map(x => {
                        return {
                            pinyin: this.parsePinyin(this.dict[x]), //todo: search the trie, rather than just dict.
                            cchar: x
                        }
                    })
            },
            () => {
                console.log(this.state.values);
            },
        );
        // }
    };

    render() {
        const { values } = this.state;
        return (
            <Container>
                <Input type="text" onChange={this.handleChange} />
                <Display>
                    {values.map((item, index) => {
                        // console.log(item);
                        return (
                            <LetterContainer key={index}>
                                <Annotation>{item.pinyin}</Annotation>
                                <Text>{item.cchar}</Text>
                            </LetterContainer>
                        );
                    })}
                </Display>
            </Container>
        );
    }
}

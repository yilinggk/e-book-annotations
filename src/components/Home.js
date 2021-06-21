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

const NBSP = '\u00a0'

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
        if (pinyin == undefined || pinyin == "") {
            return ""
        }

        let accent = pinyin[pinyin.length - 1];
        var word = pinyin.substr(0, pinyin.length - 1);
        for (var i = 0; i < pinyin.length; i++) {
            let char = pinyin[i].toLowerCase()
            if (char == "u" && pinyin[i + 1] == ":") {
                char = 'u:'
            }

            if (this.vowels[char]) {
                return word.replace(char, this.vowels[char][accent])
            }
        }
        return word
    }

    isChinese(str) {
        // Randomly taken from https://flyingsky.github.io/2018/01/26/javascript-detect-chinese-japanese/
        var REGEX_CHINESE = new RegExp(
            ['[\\u4e00-\\u9fff]',
            '|[\\u3400-\\u4dbf]',
            '|[\\u{20000}-\\u{2a6df}]',
            '|[\\u{2a700}-\\u{2b73f}]',
            '|[\\u{2b740}-\\u{2b81f}]',
            '|[\\u{2b820}-\\u{2ceaf}]',
            '|[\\uf900-\\ufaff]',
            '|[\\u3300-\\u33ff]',
            '|[\\ufe30-\\ufe4f]',
            '|[\\uf900-\\ufaff]',
            '|[\\u{2f800}-\\u{2fa1f}]'].join(''), 'u');
        return REGEX_CHINESE.test(str);
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
        var lst = [];
        var curWord = "";
        e.target.value.split('').forEach(char => {
            if (this.isChinese(char)) {
                if (curWord != "") {
                    lst.push({
                        pinyin: NBSP,
                        cchar: curWord
                    })
                    curWord = "";
                }
                lst.push({
                    //todo: search the trie, rather than just dict.
                    pinyin: this.parsePinyin(this.dict[char]),
                    cchar: char
                })
            } else {
                curWord += char;
            }
        })
        if (curWord != "") {
            lst.push({
                pinyin: NBSP,
                cchar: curWord
            })
            curWord = "";
        }

        this.setState(
            {
                values: lst
                // e.target.value.split('').map(x => {
                //     if(this.isChinese(x)){
                //         return {
                //             //todo: search the trie, rather than just dict.
                //             pinyin: this.parsePinyin(this.dict[x]), 
                //             cchar: x
                //         }
                //     }
                // })
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

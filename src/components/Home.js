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
        //todo: 多音字. currently, dict just gets overwritten, so 
        // i think it's currently the most unpopular 多音字.
        // maybe make a queue? add to the end, and when we fetch,
        // we want the first (hopefully most common).
        //  TODO: possible new feature? have user correct it? 
        //      with our current infrastructure, we can add 
        //      surrounding words into the dict, and it can remember
        //      that way?

        data.forEach(entry => {
            this.trie.insert(entry["simplified"])
            this.dict[entry["simplified"]] = entry["pinyin"];
        });

        this.vowels = require('./data/vowels.json');
    }

    /**
     * Parses pinyin from ascii to utf-8
     *  i.e. from 'san1' into 'sān'
     * @param {*} pinyin in ascii
     * @returns the proper pinyin, ready to display
     */
    parsePinyin(pinyin) {
        // console.log(pinyin)
        if (pinyin == undefined || pinyin == "") {
            return ""
        }

        let accent = pinyin[pinyin.length - 1];
        var word = pinyin.substr(0, pinyin.length - 1);

        // TODO: accent priority should be in the order aoeiuü
        // Note: in the case of 'iu' or 'ui', accent goes onto the terminal
        //      Ex. liú or guǐ
        // source: http://www.ichineselearning.com/learn/pinyin-tones.html
        
        //replaces first vowel encountered.
        for (var i = 0; i < pinyin.length; i++) {
            let char = pinyin[i].toLowerCase()
            // ü is written as u: in ascii
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
        // Randomly taken from; 
        // https://flyingsky.github.io/2018/01/26/javascript-detect-chinese-japanese/
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
        let text = e.target.value;
        console.log("===============================")
        console.log(text)

        // Fragments? Verses?
        // replace all '.'
        var fragments = text.split('。');
        for(var i = 0; i < fragments.length - 1; i++){
            fragments[i] += '。'
        }

        //replace all ','
        for(var i = 0; i < fragments.length; i++){
            var fragment2 = fragments[i].split(',');
            for(var j = 0; j < fragment2.length -1; j++) {
                fragment2[j] = ','
            }
        }
        fragments = fragments.flat();

        var lst = [];
        for (let fragment of fragments) {
            var partial = fragment
            while (partial != "") {
                var index = 0;
                while (partial[index] != undefined && !this.isChinese(partial[index])) {
                    index += 1;
                } //get rid of all non-chinese char from beginning partial
                console.log("++++++++++++++++++++++++");
                console.log("partialStart: " + partial);
                console.log("index Of first chinese: " + index);
                if (partial.substr(0, index) != "") {
                    console.log("pushing:" + partial.substr(0, index))
                    lst.push({
                        pinyin: NBSP,
                        cchar: partial.substr(0, index)
                    })
                }
                //remove chars from partial
                partial = partial.substr(index, partial.length);
                console.log("partialAfterRemoval: " + partial);

                if (partial == "") {
                    continue; // no more chinese chars in fragment, next pls
                }

                var phrase = this.trie.findBest(partial)
                console.log("phrase: " + phrase);
                if (phrase == "") {
                    console.error("Unable to find best phrase from '" + partial + "'.");
                    return; //tentatively return cause error
                } else {
                    //found something in trie, remove from partial
                    partial = partial.substr(phrase.length, partial.length);
                    let pinyin = this.dict[phrase].split(" ");
                    if (phrase.length != pinyin.length) {
                        console.error("pinyin and phrase have different lengths O.o")
                        console.error("phrase: " + phrase)
                        console.error("pinyin: " + pinyin)
                        return; //tentatively return cause error
                    }

                    // push all phrases
                    for (var i = 0; i < phrase.length; i++) {
                        lst.push({
                            pinyin: this.parsePinyin(pinyin[i]),
                            cchar: phrase[i]
                        })
                    }

                }
            }
        }

        // var lst = [];
        // var curWord = "";
        // e.target.value.split('').forEach(char => {
        //     console.log(char)
        //     if (this.isChinese(char)) {
        //         if (curWord != "") {
        //             lst.push({
        //                 pinyin: NBSP,
        //                 cchar: curWord
        //             })
        //             curWord = "";
        //         }
        //         lst.push({
        //             //todo: search the trie, rather than just dict.
        //             pinyin: this.parsePinyin(this.dict[char]),
        //             cchar: char
        //         })
        //     } else {
        //         curWord += char;
        //     }
        // })
        // if (curWord != "") {
        //     lst.push({
        //         pinyin: NBSP,
        //         cchar: curWord
        //     })
        //     curWord = "";
        // }

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

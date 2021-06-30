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

class DictionaryStore {
    data = {};
    constructor() { }

    add(key, value) {
        if (!this.data[key]) {
            this.data[key] = []
        }
        this.data[key].push(value)
    }

    get(key) {
        console.log(this.data[key])
        return this.data[key][0]
    }

    contains(key, value) {
        if (this.data[key]) {
            for (let c of this.data[key]) {
                console.log("comparing " + c + " and " + value)
                if (value === c) {
                    return true;
                }
            }
        }
        return false
    }

    //returns a boolean indicating whether or not the entire key is gone
    remove(key, value) {
        if (this.data[key]) {
            this.data[key] = this.data[key].filter(function (v, index, arr) {
                return value != v
            });

            if (this.data[key].length == 0) {
                delete this.data[key]
                return true;
            }
        }
        return false
    }

};

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
        let custom = require('./data/custom.json');
        let skip = require('./data/skip.json');
        console.log(data)
        console.log(custom)
        console.log(skip)

        this.trie = new Trie();
        // priority of data dict is FILO
        this.dict = new DictionaryStore();
        
        // Note: 多音字. currently, dict maps simplified -> list of pinyins.
        // When fetching, we simply take the first element in list.
        // (which is hopefully the most common)
        
        // To prioritize something, currently just add it to custom.
        // TODO: think of a better way to handle this?
        // TODO: possible new feature? have user correct it? 
        //      with our current infrastructure, we can add 
        //      surrounding words into the custom automatically,
        //      and it can remember that way?

        //add custom first
        custom.forEach(entry => {
            let simplified = entry["simplified"]
            this.trie.insert(simplified)
            this.dict.add(simplified, entry["pinyin"]);
        });

        data.forEach(entry => {
            let simplified = entry["simplified"]
            this.trie.insert(simplified)
            this.dict.add(simplified, entry["pinyin"]);
        });

        skip.forEach(entry => {
            let simplified = entry["simplified"]
            let pinyin = entry["pinyin"]
            this.trie.insert(simplified)
            if (this.dict.contains(simplified, pinyin)) {
                //If completely removed from dict, remove from trie
                if (this.dict.remove(simplified, pinyin)) {
                    this.trie.remove(simplified);
                }
            } else {
                console.error("Unrecognized skip");
            }
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

        //special case with no vowel
        if (pinyin == "r5") {
            return "r";
        }

        let accent = pinyin[pinyin.length - 1];
        var word = pinyin.substr(0, pinyin.length - 1);

        if (accent == "5") { // 5 should be 轻声
            return word;
        }

        // Note: accent priority should be in the order aoeiuü
        // Note: in the case of 'iu' or 'ui', accent goes onto the terminal
        //      Ex. liú or guǐ
        // source: http://www.ichineselearning.com/learn/pinyin-tones.html

        var char = "";
        if (word.includes("a")) {
            char = "a"
        } else if (word.includes("o")) {
            char = "o"
        } else if (word.includes("e")) {
            char = "e"
        } else if (word.includes("iu")) {
            char = "u"
        } else if (word.includes("ui")) {
            char = "i"
        } else if (word.includes("i")) {
            char = "i"
        } else if (word.includes("u:")) {
            // confirmed by hand that u and u: don't appear in the same word
            char = "u:"
        } else if (word.includes("u")) {
            char = "u"
        } else {
            console.error("found pinyin with no vowel: " + pinyin);
        }

        if (this.vowels[char]) {
            return word.replace(char, this.vowels[char][accent])
        }
        // for (var i = 0; i < word.length; i++) {
        //     let char = word[i].toLowerCase()
        //     // ü is written as u: in ascii
        //     if (char == "u" && word[i + 1] == ":") {
        //         char = 'u:'
        //     }

        //     if (this.vowels[char]) {
        //         return word.replace(char, this.vowels[char][accent])
        //     }
        // }
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

        //TODO: make splitting into verses better...
        // Fragments? Verses?
        // replace all '.'
        var fragments = text.split('。');
        for (var i = 0; i < fragments.length - 1; i++) {
            fragments[i] += '。'
        }
 
        //replace all ','
        for (var i = 0; i < fragments.length; i++) {
            var fragment2 = fragments[i].split(',');
            for (var j = 0; j < fragment2.length - 1; j++) {
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

                //findBest is simply greedy algo, find the longest
                var phrase = this.trie.findBest(partial)
                console.log("phrase: " + phrase);
                if (phrase == "") {
                    console.error("Unable to find best phrase from '" + partial + "'.");
                    return; //tentatively return cause error
                } else {
                    //found something in trie, remove from partial
                    partial = partial.substr(phrase.length, partial.length);
                    let pinyin = this.dict.get(phrase).split(" ");
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

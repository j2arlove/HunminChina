import React, { Component } from "react";
import axios from "axios";
import "./App.css";
import Candidates from "./Candidates";
import Sentences from "./Sentences";
import combineOldHangul from "./constants/combineOldHangul";
import keyCode from "./constants/keyCode";
import keyCodeWithShift from "./constants/keyCodeWithShift";
import nonUnicodeToUnicode from "./constants/nonUnicodeToUnicode";
import specialCharacters from "./constants/specialCharacters";

window.document.title = "훈민병음 입력기";

class App extends Component {
  state = {
    isControlPressed: false,
    isShiftPressed: false,
    state: 0,
    typedCharacters: [], // 지금까지 입력한 문자들
    typingSentence: "",
    typedSentences: [],
    currentTypingCharacters: {
      // 현재 입력중인 문자
      intonation: 0, // 성조
      keys: [], // 글쇠
      states: [], // state 히스토리
      combinedHangul: ""
    },
    requestOffset: 0,
    requestCount: 10,
    jamoResponse: [],
    responseCount: 0,
    intonations: [],
    debug: false
  };

  componentDidMount() {
    document.onkeydown = this.onKeyDown;
    document.onkeyup = this.onKeyUp;
    this.registerStates();
  }

  getPressedKey = e => {
    // 눌린 키코드로 어떤 키가 눌렸는지 반환하는 함수
    // Shift를 같이 눌렀을 때 어떤 키가 눌렸는 지 자동으로 처리
    if (e.keyCode in keyCode) {
      if (keyCode[e.keyCode] === "shift") {
        return keyCode[e.keyCode];
      } else if (this.state.isShiftPressed && e.keyCode in keyCodeWithShift) {
        return keyCodeWithShift[e.keyCode];
      } else if (e.keyCode in keyCode) {
        return keyCode[e.keyCode];
      }
    }
    return null;
  };

  onKeyDown = e => {
    // 키가 내려갈 때 불리는 함수
    var pressedKey = this.getPressedKey(e);
    if (pressedKey === "shift") {
      this.setState({ isShiftPressed: true });
    } else if (pressedKey === "backspace") {
      this.backspace();
    } else if (pressedKey === "enter") {
      if (this.state.jamoResponse.length === 0) {
        this.enter();
      } else {
        this.finishSearch(
          this.state.jamoResponse[this.state.selectedWordIndex].simplified
        );
      }
    } else if (pressedKey === "ctrl") {
      this.searchByHunmin();
    } else if (this.includes(["up arrow"], pressedKey)) {
      this.setState(
        {
          requestOffset:
            this.state.requestOffset >= this.state.requestCount
              ? this.state.requestOffset - this.state.requestCount
              : 0
        },
        () => {
          this.searchByJamo();
        }
      );
    } else if (this.includes(["down arrow"], pressedKey)) {
      if (this.state.responseCount - this.state.requestOffset > 10) {
        this.setState(
          {
            requestOffset: this.state.requestOffset + this.state.requestCount
          },
          () => {
            this.searchByJamo();
          }
        );
      }
    } else if (this.includes(["left arrow"], pressedKey)) {
      this.setState({
        selectedWordIndex:
          this.state.selectedWordIndex > 0
            ? this.state.selectedWordIndex - 1
            : 0
      });
    } else if (this.includes(["right arrow"], pressedKey)) {
      this.setState({
        selectedWordIndex:
          this.state.selectedWordIndex < this.state.jamoResponse.length - 1
            ? this.state.selectedWordIndex + 1
            : this.state.jamoResponse.length - 1
      });
    } else if (pressedKey === "space bar") {
      this.finishCharacter();
      const untranslatedHangul = [
        ...this.state.typedCharacters,
        this.state.currentTypingCharacters
      ]
        .map(character => this.translateToUnicode(character.combinedHangul))
        .join("");

      this.setState({
        typingSentence: this.state.typingSentence + untranslatedHangul + " ",
        currentTypingCharacters: {
          intonation: 0, // 성조
          keys: [], // 글쇠
          states: [], // state 히스토리
          combinedHangul: ""
        },
        typedCharacters: []
      });
    } else if (this.includes(["0", "1", "2", "3", "4"], pressedKey)) {
      const intonations = [...this.state.intonations, pressedKey];
      this.setState({ intonations: intonations }, () => {
        this.searchByJamo();
      });
    } else if (pressedKey === "esc") {
      this.finishCharacter();
    } else if (pressedKey !== null) {
      this.state.states[this.state.state](pressedKey);
    }
  };

  onKeyUp = e => {
    // 키가 올라갈 때 불리는 함수
    var pressedKey = this.getPressedKey(e);
    if (pressedKey === "shift") {
      // shift 키 눌림 해제
      this.setState({ isShiftPressed: false });
    }
  };

  includes = (keys, key) => {
    return keys.indexOf(key) !== -1;
  };

  translateToUnicode = combinedHangul => {
    var index = 0;
    var stage = 0;
    var unicodeString = "";

    for (stage = 1; stage <= 3; stage++) {
      var indexCharacter = combinedHangul[index];

      if (this.includes(specialCharacters, indexCharacter)) {
        unicodeString += indexCharacter;
        index++;
      }

      if (stage === 1) {
        // 초성
        if (indexCharacter in nonUnicodeToUnicode.cho) {
          unicodeString += nonUnicodeToUnicode.cho[indexCharacter];
          index++;
        }
      } else if (stage === 2) {
        // 중성
        if (indexCharacter in nonUnicodeToUnicode.jung) {
          unicodeString += nonUnicodeToUnicode.jung[indexCharacter];
          index++;
        }
      } else if (stage === 3) {
        // 종성
        if (indexCharacter in nonUnicodeToUnicode.jong) {
          unicodeString += nonUnicodeToUnicode.jong[indexCharacter];
          index++;
        }
      }
    }
    return unicodeString;
  };

  transit = nextState => {
    this.setState({ state: nextState });
  };

  typedJamos = () => {
    const allCharacters = [
      ...this.state.typedCharacters,
      this.state.currentTypingCharacters
    ];

    const keys = allCharacters.map(character => character.keys);
    let jamos = [];
    keys.forEach(key => {
      jamos = [...jamos, ...key];
    });

    return jamos;
  };

  searchByJamo = () => {
    const searchParam = this.typedJamos().join("");

    if (
      !searchParam ||
      searchParam.length < 2 ||
      (searchParam.length === 2 && this.typedJamos()[1] === "`")
    )
      return;

    const serverIp = "54.180.81.102"; //'localhost';

    const url =
      this.state.intonations.length === 0
        ? `http://${serverIp}:50000/search/jamo/${searchParam}/${
            this.state.requestOffset
          }/${this.state.requestCount}`
        : `http://${serverIp}:50000/search/jamo_intonation/${searchParam}/${this.state.intonations.join(
            ","
          )}/${this.state.requestOffset}/${this.state.requestCount}`;

    axios.get(url).then(response => {
      this.setState({
        selectedWordIndex: 0,
        jamoResponse: response.data.candidates,
        responseCount: response.data.count
      });
    });
  };

  searchByHunmin = () => {
    const searchParam = this.typedJamos().join("");

    if (!searchParam || searchParam.length <= 1) return;

    const serverIp = "54.180.81.102"; //'localhost';

    const url = `http://${serverIp}:50000/search/hunmin/${searchParam}`;

    axios.get(url).then(response => {
      console.log(response.data);
      this.setState({
        selectedWordIndex: 0,
        jamoResponse: response.data.candidates
      });
    });
  };

  addToCurrentCharacter = key => {
    const currentTypingCharacters = { ...this.state.currentTypingCharacters };

    currentTypingCharacters.keys.push(key);
    currentTypingCharacters.states.push(this.state.state);

    this.setState({ currentTypingCharacters, requestOffset: 0 }, () => {
      this.searchByJamo();
      this.combineHangul(this.state.currentTypingCharacters);
    });
  };

  backspace = () => {
    if (this.state.currentTypingCharacters.keys.length === 0) {
      // 현재 입력중인 글자가 없을때
      this.setState({
        jamoResponse: [],
        responseCount: 0,
        requestOffset: 0
      });
      if (this.state.typedCharacters.length > 0) {
        // 이미 입력된 글자가 있을때
        const typedCharacters = [...this.state.typedCharacters];
        typedCharacters.pop();
        this.setState({ typedCharacters }, () => {
          this.searchByJamo();
          this.combineHangul(this.state.currentTypingCharacters);
        }); // 한 자를 지움
      } else if (this.state.typingSentence.length > 0) {
        const typingSentence = this.state.typingSentence.substring(
          0,
          this.state.typingSentence.length - 1
        );
        this.setState({ typingSentence: typingSentence });
      }
    } else {
      const currentTypingCharacters = { ...this.state.currentTypingCharacters };
      currentTypingCharacters.keys.pop(); // 한 글쇠를 지움
      const prevState = currentTypingCharacters.states.pop(); // 한 state를 지움
      this.setState(
        {
          currentTypingCharacters,
          intonations: [], //성조 입력 지움
          state: prevState,
          requestOffset: 0
        },
        () => {
          this.searchByJamo();
          this.combineHangul(this.state.currentTypingCharacters);
        }
      ); // 이전 state로 되돌림
    }
  };

  enter = () => {
    const untranslatedHangul = [
      ...this.state.typedCharacters,
      this.state.currentTypingCharacters
    ]
      .map(character => this.translateToUnicode(character.combinedHangul))
      .join("");

    this.setState({
      isControlPressed: false,
      isShiftPressed: false,
      state: 0,
      typedCharacters: [],
      currentTypingCharacters: {
        intonation: 0,
        keys: [],
        states: [],
        combinedHangul: ""
      },
      requestOffset: 0,
      requestCount: 10,
      jamoResponse: [],
      responseCount: 0,
      intonations: [],
      typedSentences: [
        ...this.state.typedSentences,
        this.state.typingSentence + untranslatedHangul
      ],
      typingSentence: ""
    });
  };

  combineHangul = currentCharacter => {
    currentCharacter.combinedHangul = currentCharacter.keys.join("");
    for (let combination of Object.keys(combineOldHangul)) {
      currentCharacter.combinedHangul = currentCharacter.combinedHangul.replace(
        combination,
        combineOldHangul[combination]
      );
    }
    this.setState({
      currentTypingCharacters: this.state.currentTypingCharacters
    });
  };

  finishCharacter = () => {
    this.combineHangul(this.state.currentTypingCharacters);

    const typedCharacters = [...this.state.typedCharacters];
    typedCharacters.push(this.state.currentTypingCharacters);
    this.setState({ typedCharacters });

    this.setState({
      currentTypingCharacters: {
        intonation: 0,
        keys: [],
        states: [],
        combinedHangul: ""
      }
    });
  };

  removeOneCurrentKey = () => {
    const currentTypingCharacters = { ...this.state.currentTypingCharacters };
    currentTypingCharacters.states.pop();
    const returnKey = currentTypingCharacters.keys.pop();

    this.setState({ currentTypingCharacters });

    return returnKey;
  };

  registerStates = () => {
    const states = {};
    states[0] = key => {
      if (this.includes("ㅈㅅㄹㅍ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(1);
      } else if (this.includes(["ㅈㅇ", "ㅊㅎ", "ㅅㅇ", "ㄹㅇ", "ㅍㅇ"], key)) {
        this.addToCurrentCharacter(key);
        this.transit(3);
      } else if (this.includes("ㄱㄴㄷㅁㅂㅅㅇㅋㅌㅎㄲㄸㅃㅉㅆ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(3);
      } else if (this.includes(["ㅊ"], key)) {
        this.addToCurrentCharacter(key);
        this.transit(4);
      } else if (this.includes("ㅏㅑㅓㅕㅛㅠㅣㅐㅔㅒㅖ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(9);
      } else if (this.includes("ㅗ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(10);
      } else if (this.includes("ㅜ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(11);
      } else if (this.includes("ㅡ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(12);
      } else {
        this.addToCurrentCharacter(key);
        this.finishCharacter();
        this.transit(0);
      }
    };

    states[1] = key => {
      if (this.includes("`", key)) {
        this.addToCurrentCharacter(key);
        this.transit(3);
      } else if (this.includes("ㅏㅑㅓㅕㅛㅠㅣㅐㅔㅒㅖ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(2);
      } else if (this.includes("ㅗ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(5);
      } else if (this.includes("ㅜ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(6);
      } else if (this.includes("ㅡ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(7);
      } else {
        this.finishCharacter();
        this.transit(0);
        this.state.states[this.state.state](key);
      }
    };

    states[3] = key => {
      if (
        this.includes(
          [
            "ㄱ",
            "ㄴ",
            "ㄷ",
            "ㄹ",
            "ㅁ",
            "ㅂ",
            "ㅅ",
            "ㅇ",
            "ㅈ",
            "ㅊ",
            "ㅋ",
            "ㅌ",
            "ㅍ",
            "ㅎ",
            "ㅈㅇ",
            "ㅊㅎ",
            "ㅅㅇ",
            "ㄹㅇ",
            "ㅍㅇ"
          ],
          key
        )
      ) {
        this.finishCharacter();
        this.transit(0);
        states[this.state.state](key);
      } else if (this.includes("ㅏㅑㅓㅕㅛㅠㅣㅐㅔㅒㅖ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(2);
      } else if (this.includes("ㅗ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(5);
      } else if (this.includes("ㅜ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(6);
      } else if (this.includes("ㅡ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(7);
      } else {
        this.finishCharacter();
        this.transit(0);
        this.state.states[this.state.state](key);
      }
    };

    states[4] = key => {
      if (this.includes("`", key)) {
        this.addToCurrentCharacter(key);
        this.transit(3);
      } else if (this.includes("ㅏㅑㅓㅕㅛㅠㅣㅐㅔㅒㅖ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(2);
      } else if (this.includes("ㅗ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(5);
      } else if (this.includes("ㅜ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(6);
      } else if (this.includes("ㅡ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(7);
      } else {
        this.finishCharacter();
        this.transit(0);
        this.state.states[this.state.state](key);
      }
    };

    states[2] = key => {
      if (this.includes("ㄴㄹㅇ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(14);
      } else {
        this.finishCharacter();
        this.transit(0);
        this.state.states[this.state.state](key);
      }
    };

    states[5] = key => {
      if (this.includes("ㄴㄹㅇ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(14);
      } else if (this.includes("ㅏㅐㅣ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(8);
      } else {
        this.finishCharacter();
        this.transit(0);
        this.state.states[this.state.state](key);
      }
    };

    states[6] = key => {
      if (this.includes("ㄴㄹㅇ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(14);
      } else if (this.includes("ㅓㅣㅔ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(8);
      } else {
        this.finishCharacter();
        this.transit(0);
        this.state.states[this.state.state](key);
      }
    };

    states[7] = key => {
      if (this.includes("ㄴㄹㅇ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(14);
      } else if (this.includes("ㅣ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(8);
      } else {
        this.finishCharacter();
        this.transit(0);
        this.state.states[this.state.state](key);
      }
    };

    states[8] = key => {
      if (this.includes("ㄴㄹㅇ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(14);
      } else {
        this.finishCharacter();
        this.transit(0);
        this.state.states[this.state.state](key);
      }
    };

    states[9] = key => {
      this.finishCharacter();
      this.transit(0);
      this.state.states[this.state.state](key);
    };

    states[10] = key => {
      if (this.includes("ㅏㅐㅣ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(13);
      } else {
        this.finishCharacter();
        this.transit(0);
        this.state.states[this.state.state](key);
      }
    };

    states[11] = key => {
      if (this.includes("ㅓㅣㅔ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(13);
      } else {
        this.finishCharacter();
        this.transit(0);
        this.state.states[this.state.state](key);
      }
    };

    states[12] = key => {
      if (this.includes("ㅣ", key)) {
        this.addToCurrentCharacter(key);
        this.transit(13);
      } else {
        this.finishCharacter();
        this.transit(0);
        this.state.states[this.state.state](key);
      }
    };

    states[13] = key => {
      this.finishCharacter();
      this.transit(0);
      this.state.states[this.state.state](key);
    };

    states[14] = key => {
      if (this.includes("ㅏㅑㅓㅕㅛㅠㅣㅐㅔㅒㅖㅗㅜㅡ", key)) {
        var prevKey = this.removeOneCurrentKey();
        this.finishCharacter();
        this.transit(0);
        this.state.states[this.state.state](prevKey);
        this.state.states[this.state.state](key);
      } else {
        this.finishCharacter();
        this.transit(0);
        this.state.states[this.state.state](key);
      }
    };

    this.setState({ states });
  };

  finishSearch = word => {
    const typingSentence = this.state.typingSentence + word;

    this.setState({
      isControlPressed: false,
      isShiftPressed: false,
      state: 0,
      typedCharacters: [],
      currentTypingCharacters: {
        intonation: 0,
        keys: [],
        states: [],
        combinedHangul: ""
      },
      requestOffset: 0,
      requestCount: 10,
      jamoResponse: [],
      responseCount: 0,
      intonations: [],
      typingSentence: typingSentence
    });
  };

  render() {
    const typedCharacters = this.state.typedCharacters.map(
      (character, index) => {
        return (
          <span
            className={`intonation-${character.intonation}`}
            key={`${this.translateToUnicode(
              character.combinedHangul
            )}-${index}`}
          >
            {this.translateToUnicode(character.combinedHangul)}
          </span>
        );
      }
    );

    const currentCharacter = (
      <span
        className={`intonation-${
          this.state.currentTypingCharacters.intonation
        }`}
      >
        {this.translateToUnicode(
          this.state.currentTypingCharacters.combinedHangul
        )}
      </span>
    );

    return (
      <div className="App">
        <div className="title">중국어 입력을 위한 훈민병음 입력기</div>
        <div className="typed-characters">
          {this.state.typingSentence}
          {typedCharacters}
          <div className="typing-character">{currentCharacter}</div>
        </div>

        {this.state.responseCount > 0 ? (
          <Candidates
            selectedWordIndex={this.state.selectedWordIndex}
            candidates={this.state.jamoResponse}
            finishSearch={this.finishSearch}
          />
        ) : null}

        {this.state.responseCount > 0 ? (
          <label>
            <button
              className="left"
              disabled={
                this.state.requestOffset === 0 || this.state.responseCount === 0
              }
              onClick={() => {
                this.setState(
                  {
                    requestOffset:
                      this.state.requestOffset >= this.state.requestCount
                        ? this.state.requestOffset - this.state.requestCount
                        : 0
                  },
                  () => {
                    this.searchByJamo();
                  }
                );
              }}
            >
              ▲
            </button>
            <React.Fragment>
              &nbsp;
              {Math.floor(this.state.requestOffset / this.state.requestCount) +
                1}
              /{Math.ceil(this.state.responseCount / this.state.requestCount)}
              &nbsp;
            </React.Fragment>
            <button
              disabled={
                this.state.requestOffset >=
                  this.state.responseCount - this.state.requestCount ||
                this.state.responseCount === 0
              }
              onClick={() => {
                this.setState(
                  {
                    requestOffset:
                      this.state.requestOffset + this.state.requestCount
                  },
                  () => {
                    this.searchByJamo();
                  }
                );
              }}
            >
              ▼
            </button>
            <br />
            <br />
          </label>
        ) : null}

        <Sentences typedSentences={this.state.typedSentences} />
        
      </div>
    );
  }
}

export default App;

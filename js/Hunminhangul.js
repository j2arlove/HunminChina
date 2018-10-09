var initialEnvironment = {
  isControlPressed: false,
  isShiftPressed: false,
  state: 0,
  typedCharacters: [], // 지금까지 입력한 문자들
  currentTypingCharacters: {
    // 현재 입력중인 문자
    intonation: 0, // 성조
    keys: [], // 글쇠
    states: [], // state 히스토리
    combinedHangul: ""
  }
};
var env = {}; // 에디터가 가지고 있는 정보 (initialEnvironment 에서 시작함)
var states = {}; // state 정보
var chat_contents = "";

var specialCharacters = [
  ",",
  ".",
  "/",
  " ",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "-",
  "=",
  "`",
  "<",
  ">",
  "?",
  ")",
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  "_",
  "+",
  "~",
  "[",
  "]",
  "{",
  "}",
  "|",
  ":",
  ";"
  //  "'"
];
var keyCode = {
  65: "ㅁ",
  66: "ㅠ",
  67: "ㅊ",
  68: "ㅇ",
  69: "ㄷ",
  70: "ㄹ",
  71: "ㅎ",
  72: "ㅗ",
  73: "ㅑ",
  74: "ㅓ",
  75: "ㅏ",
  76: "ㅣ",
  77: "ㅡ",
  78: "ㅜ",
  79: "ㅐ",
  80: "ㅔ",
  81: "ㅂ",
  82: "ㄱ",
  83: "ㄴ",
  84: "ㅅ",
  85: "ㅕ",
  86: "ㅍ",
  87: "ㅈ",
  88: "ㅌ",
  89: "ㅛ",
  90: "ㅋ",
  17: "ctrl",
  16: "shift",
  8: "backspace",
  13: "enter",
  37: "left arrow",
  38: "up arrow",
  39: "right arrow",
  40: "down arrow",
  188: ",",
  190: ".",
  191: "/",
  32: " ",
  48: "0",
  49: "1",
  50: "2",
  51: "3",
  52: "4",
  53: "5",
  54: "6",
  55: "7",
  56: "8",
  57: "9",
  189: "-",
  187: "=",
  192: "`",
  219: "[",
  221: "]",
  186: ";"
  //  222: "'"
};
var keyCodeWithShift = {
  69: "ㄸ",
  79: "ㅒ",
  80: "ㅖ",
  81: "ㅃ",
  82: "ㄲ",
  84: "ㅆ",
  87: "ㅉ",
  188: "<",
  190: ">",
  191: "?",
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  189: "_",
  187: "+",
  192: "~",
  219: "{",
  221: "}",
  //  220: "|",
  186: ":"
};
var combineOldHangul = {
  ㅊㅎ: "ᅓ",
  ㄹㅇ: "ᄛ",
  ㅅㅇ: "ᄵ",
  ㅍㅇ: "ᅗ",
  ㅈㅇ: "ᅍ",
  ㅗㅏ: "ㅘ",
  ㅗㅐ: "ㅙ",
  ㅗㅣ: "ㅚ",
  ㅜㅓ: "ㅝ",
  ㅜㅔ: "ㅞ",
  ㅜㅣ: "ㅟ",
  ㅡㅣ: "ㅢ"
};
var keyToIntonation = {
  "right arrow": 1,
  "up arrow": 2,
  "left arrow": 3,
  "down arrow": 4
};
var nonUnicodeToUnicode = {
  cho: {
    ㄱ: "ᄀ",
    ㄲ: "ᄁ",
    ㄴ: "ᄂ",
    ㄷ: "ᄃ",
    ㄸ: "ᄄ",
    ㄹ: "ᄅ",
    ㅁ: "ᄆ",
    ㅂ: "ᄇ",
    ㅃ: "ᄈ",
    ㅅ: "ᄉ",
    ㅆ: "ᄊ",
    ㅇ: "ᄋ",
    ㅈ: "ᄌ",
    ㅉ: "ᄍ",
    ㅊ: "ᄎ",
    ㅋ: "ᄏ",
    ㅌ: "ᄐ",
    ㅍ: "ᄑ",
    ㅎ: "ᄒ",
    ᅓ: "ᅓ",
    ᄛ: "ᄛ",
    ᄵ: "ᄵ",
    ᅗ: "ᅗ",
    ᅍ: "ᅍ"
  },
  jung: {
    ㅏ: "ᅡ",
    ㅐ: "ᅢ",
    ㅑ: "ᅣ",
    ㅒ: "ᅤ",
    ㅓ: "ᅥ",
    ㅔ: "ᅦ",
    ㅕ: "ᅧ",
    ㅖ: "ᅨ",
    ㅗ: "ᅩ",
    ㅘ: "ᅪ",
    ㅙ: "ᅫ",
    ㅚ: "ᅬ",
    ㅛ: "ᅭ",
    ㅜ: "ᅮ",
    ㅝ: "ᅯ",
    ㅞ: "ᅰ",
    ㅟ: "ᅱ",
    ㅠ: "ᅲ",
    ㅡ: "ᅳ",
    ㅢ: "ᅴ",
    ㅣ: "ᅵ"
  },
  jong: {
    ㄴ: "ᆫ",
    ㅇ: "ᆼ",
    ㄹ: "ᆯ"
  }
};

function init() {
  env = initialEnvironment;
  document.onkeydown = onKeyDown;
  document.onkeyup = onKeyUp;
  registerStates();
  flushOutput();
}

function getPressedKey(e) {
  // 눌린 키코드로 어떤 키가 눌렸는지 반환하는 함수
  // Shift를 같이 눌렀을 때 어떤 키가 눌렸는 지 자동으로 처리
  if (e.keyCode in keyCode) {
    if (keyCode[e.keyCode] === "shift") {
      return keyCode[e.keyCode];
    } else if (env.isShiftPressed && e.keyCode in keyCodeWithShift) {
      return keyCodeWithShift[e.keyCode];
    } else if (e.keyCode in keyCode) {
      return keyCode[e.keyCode];
    }
  }
  return null;
}

function onKeyDown(e) {
  // 키가 내려갈 때 불리는 함수
  var pressedKey = getPressedKey(e);
  if (pressedKey === "shift") {
    env.isShiftPressed = true;
    flushOutput();
  } else if (pressedKey === "backspace") {
    backspace();
    flushOutput();
  } else if (
    includes(
      ["up arrow", "left arrow", "right arrow", "down arrow"],
      pressedKey
    )
  ) {
    env.currentTypingCharacters.intonation = keyToIntonation[pressedKey];
    flushOutput();
  } else if (pressedKey === "enter") {
    enter();
  } else if (pressedKey !== null) {
    states[env.state](pressedKey);
    flushOutput();
  }
}

function onKeyUp(e) {
  // 키가 올라갈 때 불리는 함수
  var pressedKey = getPressedKey(e);
  if (pressedKey === "shift") {
    // shift 키 눌림 해제
    env.isShiftPressed = false;
  }
}

function translateToUnicode(combinedHangul) {
  var index = 0;
  var stage = 0;
  var unicodeString = "";

  for (stage = 1; stage <= 3; stage++) {
    var indexCharacter = combinedHangul[index];

    if (includes(specialCharacters, indexCharacter)) {
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
}

function flushOutput() {
  var characterOutput = "";

  for (var i = 0; i < env.typedCharacters.length; i++) {
    character = env.typedCharacters[i];
    characterOutput += "<span class='intonation-{0}'>{1}</span>".format(
      character.intonation,
      translateToUnicode(character.combinedHangul)
    );
  }

  var hangul = characterOutput;
  var currentCharacterOutput = "<span class='intonation-{0}'>{1}</span>".format(
    env.currentTypingCharacters.intonation,
    env.currentTypingCharacters.keys.join("")
  );

  $(".typed-characters").html(
    characterOutput + "<div class='typing-character'>"
  );
  $(".typing-character").html(currentCharacterOutput);
  $(".status").html("State: " + env.state);
  return hangul;
}

function enter() {
  finishCharacter();
  chat_contents += "<div class='bubble'>{0}</div>".format(flushOutput());
  $(".chat").html(chat_contents);
  $(".typed-characters").html("");
  env.typedCharacters.splice(0, env.typedCharacters.length);
  transit(0);
}

function transit(nextState) {
  env.state = nextState;
}

function includes(keys, key) {
  return keys.indexOf(key) !== -1;
}

function addToCurrentCharacter(key) {
  env.currentTypingCharacters.keys.push(key);
  env.currentTypingCharacters.states.push(env.state);
}

function backspace() {
  if (env.currentTypingCharacters.keys.length === 0) {
    // 현재 입력중인 글자가 없을때
    if (env.typedCharacters.length > 0) {
      // 이미 입력된 글자가 있을때
      env.typedCharacters.pop(); // 한 자를 지움
    }
  } else {
    env.currentTypingCharacters.keys.pop(); // 한 글쇠를 지움
    prevState = env.currentTypingCharacters.states.pop(); // 한 state를 지움
    env.state = prevState; // 이전 state로 되돌림
  }
  flushOutput();
}

function combineHangul(currentCharacter) {
  currentCharacter.combinedHangul = currentCharacter.keys.join("");
  for (combination of Object.keys(combineOldHangul)) {
    currentCharacter.combinedHangul = currentCharacter.combinedHangul.replace(
      combination,
      combineOldHangul[combination]
    );
  }
}

function finishCharacter() {
  env.typedCharacters.push(env.currentTypingCharacters);
  combineHangul(env.currentTypingCharacters);

  env.currentTypingCharacters = {
    intonation: 0,
    keys: [],
    states: [],
    combinedHangul: ""
  };
}

function removeOneCurrentKey() {
  env.currentTypingCharacters.states.pop();
  return env.currentTypingCharacters.keys.pop();
}

function registerStates() {
  states[0] = function(key) {
    if (includes("ㅈㅅㄹㅍ", key)) {
      addToCurrentCharacter(key);
      transit(1);
    } else if (includes(["ㅈㅇ", "ㅊㅎ", "ㅅㅇ", "ㄹㅇ", "ㅍㅇ"], key)) {
      addToCurrentCharacter(key);
      transit(3);
    } else if (includes("ㄱㄴㄷㅁㅂㅅㅇㅋㅌㅎㄲㄸㅃㅉㅆ", key)) {
      addToCurrentCharacter(key);
      transit(3);
    } else if (includes(["ㅊ"], key)) {
      addToCurrentCharacter(key);
      transit(4);
    } else if (includes("ㅏㅑㅓㅕㅛㅠㅣㅐㅔㅒㅖ", key)) {
      addToCurrentCharacter(key);
      transit(9);
    } else if (includes("ㅗ", key)) {
      addToCurrentCharacter(key);
      transit(10);
    } else if (includes("ㅜ", key)) {
      addToCurrentCharacter(key);
      transit(11);
    } else if (includes("ㅡ", key)) {
      addToCurrentCharacter(key);
      transit(12);
    } else {
      addToCurrentCharacter(key);
      finishCharacter();
      transit(0);
    }
  };

  states[1] = function(key) {
    if (includes("ㅇ", key)) {
      addToCurrentCharacter(key);
      transit(3);
    } else if (includes("ㅏㅑㅓㅕㅛㅠㅣㅐㅔㅒㅖ", key)) {
      addToCurrentCharacter(key);
      transit(2);
    } else if (includes("ㅗ", key)) {
      addToCurrentCharacter(key);
      transit(5);
    } else if (includes("ㅜ", key)) {
      addToCurrentCharacter(key);
      transit(6);
    } else if (includes("ㅡ", key)) {
      addToCurrentCharacter(key);
      transit(7);
    } else {
      finishCharacter();
      transit(0);
      states[env.state](key);
    }
  };

  states[3] = function(key) {
    if (
      includes(
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
      finishCharacter();
      transit(0);
      states[env.state](key);
    } else if (includes("ㅏㅑㅓㅕㅛㅠㅣㅐㅔㅒㅖ", key)) {
      addToCurrentCharacter(key);
      transit(2);
    } else if (includes("ㅗ", key)) {
      addToCurrentCharacter(key);
      transit(5);
    } else if (includes("ㅜ", key)) {
      addToCurrentCharacter(key);
      transit(6);
    } else if (includes("ㅡ", key)) {
      addToCurrentCharacter(key);
      transit(7);
    } else {
      finishCharacter();
      transit(0);
      states[env.state](key);
    }
  };

  states[4] = function(key) {
    if (includes("ㅎ", key)) {
      addToCurrentCharacter(key);
      transit(3);
    } else if (includes("ㅏㅑㅓㅕㅛㅠㅣㅐㅔㅒㅖ", key)) {
      addToCurrentCharacter(key);
      transit(2);
    } else if (includes("ㅗ", key)) {
      addToCurrentCharacter(key);
      transit(5);
    } else if (includes("ㅜ", key)) {
      addToCurrentCharacter(key);
      transit(6);
    } else if (includes("ㅡ", key)) {
      addToCurrentCharacter(key);
      transit(7);
    } else {
      finishCharacter();
      transit(0);
      states[env.state](key);
    }
  };

  states[2] = function(key) {
    if (includes("ㄴㄹㅇ", key)) {
      addToCurrentCharacter(key);
      transit(14);
    } else {
      finishCharacter();
      transit(0);
      states[env.state](key);
    }
  };

  states[5] = function(key) {
    if (includes("ㄴㄹㅇ", key)) {
      addToCurrentCharacter(key);
      transit(14);
    } else if (includes("ㅏㅐㅣ", key)) {
      addToCurrentCharacter(key);
      transit(8);
    } else {
      finishCharacter();
      transit(0);
      states[env.state](key);
    }
  };

  states[6] = function(key) {
    if (includes("ㄴㄹㅇ", key)) {
      addToCurrentCharacter(key);
      transit(14);
    } else if (includes("ㅓㅣㅔ", key)) {
      addToCurrentCharacter(key);
      transit(8);
    } else {
      finishCharacter();
      transit(0);
      states[env.state](key);
    }
  };

  states[7] = function(key) {
    if (includes("ㄴㄹㅇ", key)) {
      addToCurrentCharacter(key);
      transit(14);
    } else if (includes("ㅣ", key)) {
      addToCurrentCharacter(key);
      transit(8);
    } else {
      finishCharacter();
      transit(0);
      states[env.state](key);
    }
  };

  states[8] = function(key) {
    if (includes("ㄴㄹㅇ", key)) {
      addToCurrentCharacter(key);
      transit(14);
    } else {
      finishCharacter();
      transit(0);
      states[env.state](key);
    }
  };

  states[9] = function(key) {
    finishCharacter();
    transit(0);
    states[env.state](key);
  };

  states[10] = function(key) {
    if (includes("ㅏㅐㅣ", key)) {
      addToCurrentCharacter(key);
      transit(13);
    } else {
      finishCharacter();
      transit(0);
      states[env.state](key);
    }
  };

  states[11] = function(key) {
    if (includes("ㅓㅣㅔ", key)) {
      addToCurrentCharacter(key);
      transit(13);
    } else {
      finishCharacter();
      transit(0);
      states[env.state](key);
    }
  };

  states[12] = function(key) {
    if (includes("ㅣ", key)) {
      addToCurrentCharacter(key);
      transit(13);
    } else {
      finishCharacter();
      transit(0);
      states[env.state](key);
    }
  };

  states[13] = function(key) {
    finishCharacter();
    transit(0);
    states[env.state](key);
  };

  states[14] = function(key) {
    if (includes("ㅏㅑㅓㅕㅛㅠㅣㅐㅔㅒㅖㅗㅜㅡ", key)) {
      var prevKey = removeOneCurrentKey();
      finishCharacter();
      transit(0);
      states[env.state](prevKey);
      states[env.state](key);
    } else {
      finishCharacter();
      transit(0);
      states[env.state](key);
    }
  };
}

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != "undefined" ? args[number] : match;
    });
  };
}

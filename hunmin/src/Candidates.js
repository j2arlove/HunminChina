import React, { Component } from "react";

import "./Candidates.css";

class Candidates extends Component {
  state = {
    renderMode: "simplified",
  };

  render() {
    const candidates = this.props.candidates.map((candidate, index) => {

      const chinese = candidate.simplified;

      const highlightedChinese = candidate.intonation
        .split(",")
        .map((intonation, idx) => {
          return (
            <span
              key={`${chinese[idx]}-${idx}`}
              className={`intonation--${intonation}`}
            >
              {chinese[idx]}
            </span>
          );
        });

      return (
        <div
          key={`${index}-${candidate.id}`}
          className={`candidate ${this.props.selectedWordIndex === index ? 'candidate--selected' : 'candidate--not-selected'}`}
          onClick={() => {
            this.props.finishSearch(chinese);
          }}
        >
          <div className="candidate__hunmin">{candidate.hunmin}</div>
          <div className="candidate__chinese">{highlightedChinese}</div>
        </div>
      );
    });

    return (
      <div className="candidates-wrapper">
        <div className="candidates">{candidates}</div>
      </div>
    );
  }
}

export default Candidates;

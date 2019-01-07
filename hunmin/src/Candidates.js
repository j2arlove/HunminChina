import React, { Component } from "react";

import "./Candidates.css";

class Candidates extends Component {
  state = {
    renderMode: "simplified",
  };

  render() {
    const candidates = this.props.candidates.map((candidate, index) => {

      const chinese =
        this.state.renderMode === "simplified"
          ? candidate.simplified
          : candidate.traditional;

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
          className="candidate"
          onClick={() => {
            this.props.finishSearch(chinese);
          }}
        >
          <div className="candidate__hunmin">{candidate.hunmin}</div>
          <div className="candidate__chinese">{highlightedChinese}</div>
        </div>
      );
    });

    const renderModeSelector = (
      <div className="option">
        <label>
          <input
            type="radio"
            value="simplified"
            checked={this.state.renderMode === "simplified"}
            onChange={() => {
              this.setState({ renderMode: "simplified" });
            }}
          />
          Simplified
        </label>&nbsp;
        <label>
          <input
            type="radio"
            value="traditional"
            checked={this.state.renderMode === "traditional"}
            onChange={() => {
              this.setState({ renderMode: "traditional" });
            }}
          />
          Traditional
        </label>
      </div>
    );

    return (
      <div className="candidates-wrapper">
        <div className="candidates">{candidates}</div>
      </div>
    );
  }
}

export default Candidates;

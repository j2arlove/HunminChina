import React, { Component } from "react";

import "./Sentences.css";

class Sentences extends Component {
  render() {
    const sentences = this.props.typedSentences.map(sentence => {
      return <div className="sentence bubble">{sentence}</div>;
    });

    return (
      <div className="sentences-wrapper">
        <div className="sentences">{sentences}</div>
      </div>
    );
  }
}

export default Sentences;

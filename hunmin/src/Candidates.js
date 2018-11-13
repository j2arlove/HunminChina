import React, { Component } from "react";

class Candidates extends Component {
  state = {};

  render() {
    const candidates = this.props.candidates.map((candidate, index) => {
      return (
        <div key={`${index}-${candidate[0]}`}>
          {candidate[1]}
          {candidate[4]}
        </div>
      );
    });

    return <div className="candidates">{candidates}</div>;
  }
}

export default Candidates;

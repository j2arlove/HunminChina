import React, { Component } from "react";

import "./Candidates.css";

class Candidates extends Component {
  state = {
    renderMode: "simplified",
    currentPage: 1,
    endPage: 3
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
      <div>
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

    //추가한 부분이나 실패 
    // 1. 후보군이 나온 후 버튼이 생성되었으면 좋겠음
    // 2. 최종 페이지 번호를 받아 오지 못함
    // 3. 이것에 따른 페이지 번호를 스트링으로 서버에 보내야 하므로... 여기서 하는게 아닐 수 있음
    const pageButton = (
    //  endPage = this.props.candidates.page;

      <div>
          <button
            onClick={() => {
              if (this.state.currentPage > 1) this.state.currentPage--;
              else this.setState({ currentPage: 1 });
              console.log(this.state.currentPage)
            }}>
            ◀
          </button>&nbsp;{this.state.currentPage}/{this.state.endPage}&nbsp;
          <button
            onClick={() =>{
              if (this.state.currentPage < this.state.endPage) this.state.currentPage++;
              else this.state.currentPage = this.state.endPage;
              console.log(this.state.currentPage)
            }}
          >
            ▶
          </button>
      </div>
    );

    return (
      <div className="candidates-wrapper">
        <div className="candidates-option">{renderModeSelector}</div>
        <div className="candidates">{candidates}</div>
        <div>{pageButton}</div>
      </div>
    );
  }
}

export default Candidates;

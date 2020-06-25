import React from "react";
import { css } from "@emotion/core";
import RingLoader from "react-spinners/RingLoader";

// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
  z-index: 1;
`;

class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  setLoading = () => {
    this.setState({ loading: true });
  };
  hideLoading = () => {
    this.setState({ loading: false });
  };

  render() {
    return (
      <div style={{ height: "100%", width: "100%" }}>
        <RingLoader
          css={override}
          size={150}
          color={"#123abc"}
          loading={this.state.loading}
        />
      </div>
    );
  }
}

export default Loading;

import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputBase from "@material-ui/core/Input";

class ThresholdInput extends Component {
  render() {
    return (
      <Typography component="div" variant="h6" className="text">
        <InputBase
          value={(this.props.value * this.props.multiplier).toFixed(0)}
          onChange={this.props.onChange}
          endAdornment={
            <InputAdornment position="end">
              <Typography
                variant="h6"
                className="text"
                style={{ fontWeight: 600 }}
              >
                %
              </Typography>
            </InputAdornment>
          }
          inputProps={{ step: 1, min: 0, max: 100, type: "number" }}
          style={{ fontSize: 20, width: 80, fontWeight: 600 }}
        />
      </Typography>
    );
  }
}

export default ThresholdInput;

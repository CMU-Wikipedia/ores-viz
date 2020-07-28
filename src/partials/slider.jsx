import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Slider from "@material-ui/core/Slider";
import Typography from "@material-ui/core/Typography";

class ThresholdeSlider extends Component {
  constructor(props) {
    super(props);
    this.getText = this.getText.bind(this);
  }

  getText = (value) => {
    return `${value}%`;
  };

  state = {};
  render() {
    return (
      <div style={{ position: "relative", marginTop: "5px" }}>
        <div
          style={{
            position: "absolute",
            width: "100%",
            top: "10px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography
            style={{
              textAlign: "left",
              fontWeight: "bold",
            }}
          >
            {[<span>&#9664;</span>, " Identify More"]}
          </Typography>

          <Typography
            variant="body2"
            style={{ color: "gray", textAlign: "center" }}
          >
            {this.props.middleText != null ? this.props.middleText() : null}
          </Typography>

          <Typography style={{ textAlign: "right", fontWeight: "bold" }}>
            {["Identify Less ", <span>&#9654;</span>]}
          </Typography>
        </div>
        <div>
          {this.props.color === "orange" ? (
            <OrangeSlider
              value={this.props.value}
              valueLabelDisplay="auto"
              valueLabelFormat={this.getText}
              aria-label="pretto slider"
              defaultValue={this.props.defaultValue}
              onChange={this.props.onChangeCommitted}
              onChangeCommitted={this.props.onChangeCommitted}
            />
          ) : (
            <BlackSlider
              value={this.props.value}
              valueLabelDisplay="auto"
              valueLabelFormat={this.getText}
              aria-label="pretto slider"
              defaultValue={this.props.defaultValue}
              onChange={this.props.onChangeCommitted}
              onChangeCommitted={this.props.onChangeCommitted}
            />
          )}
        </div>
      </div>
    );
  }
}

export default ThresholdeSlider;

const OrangeSlider = withStyles({
  root: {
    color: "#C57619",
    height: 10,
    marginTop: "50px",
    padding: "0px",
  },
  thumb: {
    height: 18,
    width: 18,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    marginTop: -8,
    marginLeft: -9,
    "&:focus, &:hover, &$active": {
      boxShadow: "inherit",
    },
  },
  active: {},
  valueLabel: {
    left: "calc(-50%+12px)",
    fontWeight: "bold",
  },
  track: {
    height: 4,
    borderRadius: 4,
    color: "#909090",
  },
  rail: {
    height: 4,
    borderRadius: 4,
    color: "#C57619",
    opacity: "100%",
  },
})(Slider);

const BlackSlider = withStyles({
  root: {
    color: "#000000",
    height: 10,
    marginTop: "50px",
    padding: "0px",
  },
  thumb: {
    height: 18,
    width: 18,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    marginTop: -8,
    marginLeft: -9,
    "&:focus, &:hover, &$active": {
      boxShadow: "inherit",
    },
  },
  active: {},
  valueLabel: {
    left: "calc(-50%+12px)",
    fontWeight: "bold",
  },
  track: {
    height: 4,
    borderRadius: 4,
    color: "#909090",
  },
  rail: {
    height: 4,
    borderRadius: 4,
    color: "#000000",
    opacity: "100%",
  },
})(Slider);

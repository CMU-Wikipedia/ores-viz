import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";

class Metric extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDesc: false,
    };
  }

  componentDidMount() {
    this.setState({ showDesc: false });
  }

  toggle(val) {
    this.setState({ showDesc: val });
  }

  render() {
    const showDesc = this.state.showDesc;
    return (
      <Typography
        variant="body2"
        className="metric"
        style={{ color: !this.state.showDesc ? "black" : this.props.accent }}
        onMouseEnter={() => this.toggle(true)}
        onMouseLeave={() => this.toggle(false)}
      >
        <strong>{this.props.title}</strong>: {this.props.value}{" "}
        {showDesc && (
          <em style={{ color: this.props.accent }}>{this.props.desc}</em>
        )}
      </Typography>
    );
  }
}

export default Metric;

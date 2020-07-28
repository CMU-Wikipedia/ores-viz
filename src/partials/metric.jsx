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

  showDescription() {
    this.setState({ showDesc: true });
  }

  hideDescription() {
    this.setState({ showDesc: false });
  }

  render() {
    const showDesc = this.state.showDesc;
    return (
      <Typography
        variant="body2"
        className="metric"
        style={{ margin: 5 }}
        onMouseEnter={() => this.showDescription()}
        onMouseLeave={() => this.hideDescription()}
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

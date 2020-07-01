import React, { Component } from "react";
class Circle extends Component {
  constructor(props) {
    super(props);
  }
  state = {};
  render() {
    const size = this.props.size / 2;
    return (
      <svg height={size * 2} width={size * 2}>
        <circle cx={size} cy={size} r={size} fill={this.props.color} />
      </svg>
    );
  }
}

export class Cross extends Component {
  constructor(props) {
    super(props);
  }
  state = {};
  render() {
    const size = this.props.size;
    return (
      <svg height={size} width={size}>
        <line
          x1="0"
          y1="0"
          x2={size}
          y2={size}
          stroke={this.props.color}
          strokeWidth={2}
        />
        <line
          x1="0"
          y1={size}
          x2={size}
          y2="0"
          stroke={this.props.color}
          strokeWidth={2}
        />
      </svg>
    );
  }
}

export default Circle;

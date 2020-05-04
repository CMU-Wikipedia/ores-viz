import React, {Component} from 'react';
class Circle extends Component {
  constructor (props) {
    super (props);
  }
  state = {};
  render () {
    return (
      <svg height="12" width="12">
        <circle cx="6" cy="6" r="6" fill="red" />
      </svg>
    );
  }
}

export default Circle;

import React, {Component} from 'react';
class Test extends Component {
  constructor (props) {
    super (props);
    console.log ('test');
    console.log (this.props);
  }
  state = {};
  render () {
    return <div>"miao?"</div>;
  }
}

export default Test;

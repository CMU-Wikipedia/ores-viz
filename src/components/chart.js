import React, {Component} from 'react';
import BarChart from './d3example';
import * as d3 from 'd3';
import data_balanced from '../data/data_balanced.csv';
import Test from './test';

class Chart extends Component {
  constructor (props) {
    super (props);
    this.state = {
      data: null,
      change: 0,
      threshold: 0.5,
    };
  }

  componentDidMount () {
    let threshold = this.state.threshold;
    this.setState ({change: 1});
    d3
      .csv (data_balanced, d => {
        return {
          confidence_damage: +d.damagescore,
          damaging_label: d.damaging == 'True' ? true : false,
        };
      })
      .then (data => {
        this.setState ({data: data});
        this.setState ({change: 2});
      });
  }

  shouldComponentUpdate (nextProps, nextState) {
    return true;
  }

  render () {
    console.log ('render');
    console.log (this.state);
    return (
      <div>
        {/* <Test data={this.state.data} key={this.state.change} /> */}
        <BarChart data={this.state.data} key={this.state.change} />
      </div>
    );
  }
}

export default Chart;

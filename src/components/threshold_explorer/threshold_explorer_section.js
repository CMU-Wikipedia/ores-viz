import React, {Component} from 'react';
import ThresholdExplorer from './threshold_explorer';
import * as d3 from 'd3';
import data_balanced from '../../data/data_balanced.csv';
import data_performance from '../../data/performance.csv';

class Chart extends Component {
  constructor (props) {
    super (props);
    this.state = {
      data: null,
      change: 0,
    };
  }

  componentDidMount () {
    d3
      .csv (data_balanced, d => {
        return {
          confidence_faith: d.confidence_faith,
          faith_label: d.goodfaith == 'True' ? true : false,
          confidence_damage: +d.damagescore,
          damaging_label: d.damaging == 'True' ? true : false,
        };
      })
      .then (data => {
        this.setState ({data: data});
        this.setState ({change: 2});
        d3
          .csv (data_performance, d => {
            return {
              threshold: +d.threshold,
              damaging_accuracy: +d.damaging_accuracy,
              damaging_fpr: +d.damaging_fpr,
              damaging_fnr: +d.damaging_fnr,
              faith_accuracy: +d.faith_accuracy,
              faith_fpr: +d.faith_fpr,
              faith_fnr: +d.faith_fnr,
            };
          })
          .then (data => {
            this.setState ({performance_data: data});
            this.setState ({change: 3});
          });
      });
  }

  shouldComponentUpdate (nextProps, nextState) {
    return true;
  }

  render () {
    return (
      <div style={{display: 'flex'}}>
        {/* <Test data={this.state.data} key={this.state.change} /> */}
        <ThresholdExplorer
          data={this.state.data}
          performance_data={this.state.performance_data}
          key={this.state.change}
        />
      </div>
    );
  }
}

export default Chart;

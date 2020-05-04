import React, {Component} from 'react';
import * as d3 from 'd3';
import data_balanced from '../../data/data_not-balanced.csv';
import GroupCompareVisualizer from './compare_visualizer';

const groupSliceNumber = 100;
class GroupCompareChart extends Component {
  constructor (props) {
    super (props);
    this.state = {
      anonData: null,
      loggedData: null,
      newcomerData: null,
      experiencedData: null,
      change: 0,
    };
  }

  componentDidMount () {
    d3
      .csv (data_balanced, d => {
        return {
          anonymous: d.anonymous == 'True' ? true : false,
          newcomer: d.edit_years <= 8 ? true : false,
          confidence_faith: +d.confidence_faith,
          faith_label: d.goodfaith == 'True' ? true : false,
          confidence_damage: +d.confidence_damage,
          damaging_label: d.damaging == 'True' ? true : false,
        };
      })
      .then (data => {
        const anonData = data
          .filter (d => {
            return d.anonymous;
          })
          .slice (0, groupSliceNumber);
        const loggedData = data
          .filter (d => {
            return !d.anonymous;
          })
          .slice (0, groupSliceNumber);

        const newcomerData = data
          .filter (d => {
            return d.newcomer;
          })
          .slice (0, groupSliceNumber);

        const experiencedData = data
          .filter (d => {
            return !d.newcomer;
          })
          .slice (0, groupSliceNumber);
        this.setState ({
          anonData: anonData,
          loggedData: loggedData,
          newcomerData: newcomerData,
          experiencedData: experiencedData,
        });
        this.setState ({change: 2});
      });
  }

  //   shouldComponentUpdate (nextProps, nextState) {
  //     return true;
  //   }

  render () {
    console.log ('hi');
    console.log (this.props);
    return (
      <div style={{display: 'flex'}}>
        {/* <Test data={this.state.data} key={this.state.change} /> */}
        <GroupCompareVisualizer
          groupOneData={this.state.newcomerData}
          groupTwoData={this.state.experiencedData}
          key={this.state.change}
          performanceData={this.props.performanceData}
          sliceNumber={groupSliceNumber}
        />
      </div>
    );
  }
}

export default GroupCompareChart;

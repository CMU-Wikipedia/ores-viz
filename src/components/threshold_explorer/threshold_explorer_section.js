import React, { Component } from "react";
import ThresholdExplorer from "./threshold_explorer";
import * as d3 from "d3";
import data_balanced from "../../data/data_not-balanced.csv";

class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      change: 0,
    };
  }

  componentDidMount() {
    d3.csv(data_balanced, (d) => {
      return {
        confidence_faith: +d.confidence_faith,
        faith_label: d.goodfaith === "True" ? true : false,
        confidence_damage: +d.confidence_damage,
        damaging_label: d.damaging === "True" ? true : false,
        rev_id: +d.rev_id,
      };
    }).then((data) => {
      this.setState({ data: data.slice(0, 2000) });
      this.setState({ change: 2 });
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  render() {
    return (
      <div style={{ display: "flex" }}>
        {/* <Test data={this.state.data} key={this.state.change} /> */}
        <ThresholdExplorer
          data={this.state.data}
          performance_data={this.props.performanceData}
          key={this.state.change}
        />
      </div>
    );
  }
}

export default Chart;

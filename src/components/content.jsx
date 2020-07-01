import React, { Component } from "react";
import Chart from "./threshold_explorer/threshold_explorer_section";
import GroupCompareChart from "./group_compare/section";
import Recommender from "./threshold_recommender/recommender";
import Typography from "@material-ui/core/Typography";
import data_performance from "../data/performance.csv";
import * as d3 from "d3";
import styled from "styled-components";
import { curveNatural } from "d3";
import { Route, Switch } from "react-router-dom";
import About from "./about";

export const SectionHeader = styled.div`
  padding-left: 10px;
  padding-top: 10px;
  padding-bottom: 30px;
  border-bottom: 1px solid lightgrey;
`;

export const Section = styled.div`
  display: block;
  margin-bottom: 0vh;
`;

class MainContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      performance_data: null,
      change: 0,
    };
  }

  componentDidMount() {
    d3.csv(data_performance, (d) => {
      return {
        threshold: +d.threshold,
        damaging_accuracy: +d.damaging_accuracy,
        damaging_fpr: +d.damaging_fpr,
        damaging_fnr: +d.damaging_fnr,
        faith_accuracy: +d.faith_accuracy,
        faith_fpr: +d.faith_fpr,
        faith_fnr: +d.faith_fnr,
      };
    }).then((data) => {
      this.setState({ performance_data: data });
      this.setState({ change: 1 });
    });
  }

  state = {};
  render() {
    return (
      <Switch>
        <Route path="/recommender">
          <Section>
            <SectionHeader>
              <Typography variant="subtitle1" style={{ textAlign: "left" }}>
                Threshold Recommender
              </Typography>
              <div
                style={{
                  width: "50%",
                  marginTop: "10px",
                }}
              >
                <Typography variant="body2" style={{ color: "grey" }}>
                  The threshold recommender helps you decide a threshold that
                  aligns with your model preferences.{" "}
                </Typography>
              </div>
            </SectionHeader>
            <Recommender
              performanceData={this.state.performance_data}
              key={this.state.change}
            />
          </Section>
        </Route>
        <Route path="/disparity">
          <Section>
            <SectionHeader>
              <Typography variant="subtitle1" style={{ textAlign: "left" }}>
                Disparity Visualizer
              </Typography>
              <div
                style={{
                  width: "50%",
                  marginTop: "10px",
                }}
              >
                <Typography variant="body2" style={{ color: "grey" }}>
                  This visualization provides insights on how the model performs
                  for wiki’s edited by different user groups; this may help you
                  weigh the pros and cons of picking the threshold.{" "}
                </Typography>
              </div>
            </SectionHeader>
            <GroupCompareChart
              performanceData={this.state.performance_data}
              key={this.state.change}
            />
          </Section>
        </Route>
        <Route path="/explorer">
          <Section>
            <SectionHeader>
              <Typography variant="subtitle1" style={{ textAlign: "left" }}>
                Threshold Explorer
              </Typography>
              <div
                style={{
                  width: "50%",
                  marginTop: "10px",
                }}
              >
                <Typography variant="body2" style={{ color: "grey" }}>
                  Threshold Explorer helps you visualize model performance under
                  specific thresholds with an example dataset. To start, select
                  a model below, then pick a threshold.{" "}
                </Typography>
              </div>
            </SectionHeader>

            <Chart
              performanceData={this.state.performance_data}
              key={this.state.change}
            />
          </Section>
        </Route>
        <Route component={About} />
      </Switch>
    );
  }
}

export default MainContent;

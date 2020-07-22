import React, { Component } from "react";
import Chart from "./threshold_explorer/threshold_explorer_section";
import GroupCompareChart from "./group_compare/section";
import Recommender from "./recommender";
import FeatureInjector from "./injection";
import Typography from "@material-ui/core/Typography";
import data_performance from "../data/performance.csv";
import * as d3 from "d3";
import styled from "styled-components";
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

  sectionHeader(title, description) {
    return (
      <SectionHeader>
        <Typography variant="subtitle1" style={{ textAlign: "left" }}>
          {title}
        </Typography>
        <div
          style={{
            width: "50%",
            marginTop: "10px",
          }}
        >
          <Typography variant="body2" style={{ color: "grey" }}>
            {description}{" "}
          </Typography>
        </div>
      </SectionHeader>
    );
  }

  render() {
    return (
      <Switch>
        <Route path="/recommender">
          <Section>
            {this.sectionHeader(
              "Threshold Recommender",
              "The threshold recommender helps you decide a threshold that aligns with your model preferences."
            )}
            <Recommender
              performanceData={this.state.performance_data}
              key={this.state.change}
            />
          </Section>
        </Route>
        <Route path="/disparity">
          <Section>
            {this.sectionHeader(
              "Disparity Visualizer",
              "This visualization provides insights on how the model performs for wiki’s edited by different user groups; this may help you weigh the pros and cons of picking the threshold."
            )}
            <GroupCompareChart
              performanceData={this.state.performance_data}
              key={this.state.change}
            />
          </Section>
        </Route>
        <Route path="/explorer">
          <Section>
            {this.sectionHeader(
              "Threshold Explorer",
              "Threshold Explorer helps you visualize model performance under specific thresholds with an example dataset. To start, select a model below, then pick a threshold."
            )}
            <Chart
              performanceData={this.state.performance_data}
              key={this.state.change}
            />
          </Section>
        </Route>
        <Route path="/injection">
          {this.sectionHeader(
            "Feature Injection",
            "Besides the edit content, ORES also makes predictions based on the experience of the editor. Feature injection allows you to select and edit and see how the prediction changes if it's made by a different editor."
          )}
          <FeatureInjector />
        </Route>
        <Route component={About} />
      </Switch>
    );
  }
}

export default MainContent;

import React, { Component } from "react";
import * as d3 from "d3";
import Typography from "@material-ui/core/Typography";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input";
import TypeToggle from "../../partials/typeToggle";

class Recommender extends Component {
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
    this.state = {
      damaging: true,
      threshold: null,
    };
  }

  onTypeChange = (event, type) => {
    if (type != null) {
      this.setState({ damaging: type });
    }
  };

  onThresChange = (event, thres) => {
    if (thres != null) {
      this.setState({ threshold: thres });
    }
  };

  onTextChange = (event) => {
    this.setState({
      threshold: event.target.value ? Number(event.target.value) : null,
    });
  };

  componentDidMount() {
    this.setState({
      damaging: true,
      threshold: null,
    });
  }

  render() {
    const borderColor = this.state.threshold ? "#00f" : "#ddd";
    return (
      <React.Fragment>
        <div
          style={{
            width: "100%",
            display: "inline-block",
            verticalAlign: "top",
            position: "relative",
          }}
        >
          <div className="upperSettings">
            <Grid container spacing={0}>
              <TypeToggle
                damaging={this.state.damaging}
                onChange={this.onTypeChange}
                gridSize={4}
                key={this.state.damaging}
              />
              <Grid
                item
                xs={8}
                style={{ paddingLeft: 10, borderLeft: "1px solid #d3d3d3" }}
              >
                <Typography component="div" variant="subtitle2">
                  <Box>INTERACTION FLOW</Box>
                </Typography>
                <Grid container style={{ justifyContent: "space-evenly" }}>
                  {[
                    "1. Choose a Goal",
                    "2. Tune Recommendation",
                    "3. Request Performance",
                  ].map((text, index) => (
                    <Typography
                      component="span"
                      variant="h6"
                      style={{
                        fontWeight: 400,
                        paddingTop: 5,
                        paddingRight: 50,
                      }}
                    >
                      {text}
                    </Typography>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </div>
          <Grid container spacing={0} style={{ height: 800 }}>
            <Grid item xs={5}>
              <ToggleButtonGroup
                orientation="vertical"
                exclusive
                value={this.state.threshold}
                onChange={this.onThresChange}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "center",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                  height: "100%",
                  margin: "0px 15%",
                }}
              >
                {[
                  {
                    type: "Aggressive",
                    threshold: 0.12,
                    subtitle: "Tools for human reviewers",
                    description:
                      "Catch more damaging edits at the cost of some good edits being falsely predicted.",
                  },
                  {
                    type: "Balanced",
                    threshold: 0.5,
                    subtitle: "Tools for human reviewers",
                    description:
                      "Similar number of uncaught damaging edit and falsely predicted good edits.",
                  },
                  {
                    type: "Cautious",
                    threshold: 0.8,
                    subtitle: "Automated bots",
                    description:
                      "Less falsely predicted good edits at the cost of more uncaught damaging edits.",
                  },
                ].map((obj, index) => (
                  <ToggleButton
                    value={obj.threshold}
                    className="recommendOptions"
                  >
                    <Grid container spacing={0}>
                      <Grid item xs={6}>
                        <h4>{obj.type} Model</h4>
                        <h5>{obj.subtitle}</h5>
                        <p>{obj.description}</p>
                      </Grid>
                      <Grid item xs={5}>
                        <img
                          src={obj.type + ".svg"}
                          height="100%"
                          width="100%"
                        />
                      </Grid>
                    </Grid>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
            <Grid
              item
              xs={7}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div className="card" style={{ borderColor: borderColor }}>
                <Typography
                  component="div"
                  variant="subtitle2"
                  style={{ fontSize: 13, color: "#000" }}
                >
                  <Box>SUGGESTED THRESHOLD</Box>
                </Typography>
                <Input
                  value={
                    this.state.threshold
                      ? this.state.threshold.toFixed(2)
                      : "N/A"
                  }
                  onChange={this.onTextChange}
                  helperText={"N/A"}
                  inputProps={{ step: 0.01, min: 0, max: 1, type: "number" }}
                  style={{
                    fontSize: 50,
                    alignSelf: "left",
                  }}
                />
                <Typography variant="body2">
                  This threshold will catch around <strong>83%</strong> of the
                  damaging edits while having <strong>5.0%</strong> of the good
                  edits misclassified.
                </Typography>
                <ExpansionPanel>
                  <ExpansionPanelSummary>
                    <Typography variant="h5">
                      See specific performance
                    </Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <div>
                      {[
                        { name: "!f1", val: 0.97 },
                        { name: "!precision", val: 0.999 },
                        { name: "!recall", val: 0.943 },
                        { name: "accuracy", val: 0.942 },
                        { name: "f1", val: 0.175 },
                        { name: "filter_rate", val: 0.937 },
                        { name: "fpr", val: 0.057 },
                      ].map((obj, index) => (
                        <Typography variant="body2" style={{ margin: 5 }}>
                          <strong>{obj.name}</strong>: {obj.val}
                        </Typography>
                      ))}
                    </div>
                  </ExpansionPanelDetails>
                </ExpansionPanel>

                <ExpansionPanel>
                  <ExpansionPanelSummary>
                    <Typography variant="h5">
                      Copy code for this threshold
                    </Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <pre style={{ textAlign: "left" }}>
                      <p style={{ margin: 5, fontWeight: "bold" }}>
                        def compute_metrics(y_true, y_pred_scores,{" "}
                        {this.state.threshold}, model=
                        {this.state.damaging ? "damaging" : "goodfaith"}):
                      </p>
                      {[
                        "# model = damaging or goodfaith",
                        "# return a dictionary with metrics",
                        "# y_true: a np array of true labels 1/0",
                        "# y_pred_scores: a np array of predictions",
                      ].map((text, index) => (
                        <p style={{ margin: 5 }}>
                          {"  "}
                          {text}
                        </p>
                      ))}
                    </pre>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </div>
            </Grid>
          </Grid>
        </div>
      </React.Fragment>
    );
  }
}

export default Recommender;

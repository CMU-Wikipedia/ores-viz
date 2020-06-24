import React, { Component } from "react";
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
import versions from "../../data/versions.json";
import axios from "axios";

class Recommender extends Component {
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
    this.state = {
      damaging: true,
      threshold: null,
      damagingData: null,
      goodfaithData: null,
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
    this.onThresChange(
      event,
      event.target.value ? Number(event.target.value) : null
    );
  };

  getData = () => {
    function getObject(array) {
      var newArray = {};
      var arrayIdx = 0;
      var i = 0.01;

      while (i < 1 && arrayIdx < array.length) {
        // console.log(i, arrayIdx, array[arrayIdx]);
        if (array[arrayIdx] && i - array[arrayIdx]["threshold"] < 0.000001) {
          //   console.log("found", i);
          var elem = array[arrayIdx];
          newArray[i.toFixed(2)] = {
            "!f1": elem["!f1"],
            "!precision": elem["!precision"],
            "!recall": elem["!recall"],
            accuracy: elem["accuracy"],
            f1: elem["f1"],
            filter_rate: elem["filter_rate"],
            fpr: elem["fpr"],
            match_rate: elem["match_rate"],
            precision: elem["precision"],
            recall: elem["recall"],
          };
          i = Number.parseFloat(Number.parseFloat(i + 0.01).toPrecision(2));
        }
        arrayIdx = arrayIdx + 1;
      }

      //   console.log(array);
      //   console.log(newArray);

      return newArray;
    }

    axios
      .get(
        "https://ores.wikimedia.org/v3/scores/enwiki/?models=damaging&model_info=statistics.thresholds.true"
      )
      .then((res) => {
        const array =
          res.data.enwiki.models.damaging.statistics.thresholds.true;
        console.log("got damaging data");
        this.setState({ damagingData: getObject(array) });
      });

    axios
      .get(
        "https://ores.wikimedia.org/v3/scores/enwiki/?models=goodfaith&model_info=statistics.thresholds.true"
      )
      .then((res) => {
        const array =
          res.data.enwiki.models.goodfaith.statistics.thresholds.true;
        console.log("got goodfaith data");
        this.setState({ goodfaithData: getObject(array) });
      });
  };

  getProp(prop, escape) {
    if (
      this.state.threshold != null &&
      this.state.threshold > 0 &&
      this.state.threshold <= 0.98
    ) {
      return this.state.damaging
        ? this.state.damagingData[this.state.threshold.toFixed(2)][prop]
        : this.state.goodfaithData[this.state.threshold.toFixed(2)][prop];
    } else return escape;
  }

  componentDidMount() {
    this.getData();
    this.setState({
      damaging: true,
      threshold: null,
    });
  }

  render() {
    const borderColor = this.state.threshold ? "#00f" : "#ddd";
    const message = this.state.damaging ? "damaging" : "good faith";
    const opposite = this.state.damaging ? "good" : "bad faith";
    return (
      <React.Fragment>
        <div
          style={{
            width: "100%",
            display: "inline-block",
            verticalAlign: "top",
          }}
        >
          <div className="upperSettings" style={{ height: "8vh" }}>
            <Grid container spacing={0} style={{ height: "100%" }}>
              <TypeToggle
                damaging={this.state.damaging}
                onChange={this.onTypeChange}
                gridSize={4}
                key={this.state.damaging}
              />
              <Grid
                item
                xs={8}
                style={{
                  height: "auto",
                  paddingLeft: 10,
                  paddingBottom: 10,
                  borderLeft: "1px solid #d3d3d3",
                }}
              >
                <Typography component="div" variant="subtitle2">
                  <Box>INTERACTION FLOW</Box>
                </Typography>
                <Grid
                  container
                  style={{ justifyContent: "space-evenly", height: "100%" }}
                >
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
                      "Catch more " +
                      message +
                      " edits at the cost of some " +
                      opposite +
                      " edits being falsely predicted.",
                  },
                  {
                    type: "Balanced",
                    threshold: 0.5,
                    subtitle: "Tools for human reviewers",
                    description:
                      "Similar number of uncaught " +
                      message +
                      " edits and falsely predicted " +
                      opposite +
                      " edits.",
                  },
                  {
                    type: "Cautious",
                    threshold: 0.81,
                    subtitle: "Automated bots",
                    description:
                      "Less falsely predicted " +
                      opposite +
                      " edits at the cost of more uncaught " +
                      message +
                      " edits.",
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
                  inputProps={{
                    step: 0.01,
                    min: 0.01,
                    max: 0.98,
                    type: "number",
                  }}
                  style={{
                    fontSize: 50,
                    alignSelf: "left",
                  }}
                />
                <Typography variant="body2">
                  This threshold will catch around
                  <strong>
                    {" "}
                    {this.getProp("recall", "--") == "--"
                      ? "--"
                      : (this.getProp("recall", "--") * 100).toFixed(0)}
                    %{" "}
                  </strong>
                  of the {" " + message} edits while having
                  <strong>
                    {" "}
                    {this.getProp("fpr", "--") == "--"
                      ? "--"
                      : (this.getProp("fpr", "--") * 100).toFixed(0)}
                    %{" "}
                  </strong>
                  of the {" " + opposite} edits misclassified.
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
                        "!f1",
                        "!precision",
                        "!recall",
                        "accuracy",
                        "f1",
                        "filter_rate",
                        "fpr",
                      ].map((prop) => (
                        <Typography variant="body2" style={{ margin: 5 }}>
                          <strong>{prop}</strong>: {this.getProp(prop, "N/A")}
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
                        {this.state.threshold}, model="
                        {this.state.damaging ? "damaging" : "goodfaith"}"):
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

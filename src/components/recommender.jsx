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
import InputAdornment from "@material-ui/core/InputAdornment";
import TypeToggle from "../partials/typeToggle";
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
      recommendations: null,
      range: -1,
    };
  }

  onTypeChange = (event, type) => {
    if (type != null) {
      this.setState({ damaging: type });
    }
  };

  onThresChange = (event, thres) => {
    if (thres != null) {
      let diffs = [
        Math.abs(thres - this.getRec("Aggressive")),
        Math.abs(thres - this.getRec("Balanced")),
        Math.abs(thres - this.getRec("Cautious")),
      ];

      let range = 0;
      let minDiff = 1;
      for (var i = 0; i < 3; i++) {
        if (diffs[i] < minDiff) {
          minDiff = diffs[i];
          range = i;
        }
      }

      this.setState({ threshold: thres, range: range });
    }
  };

  onRangeChange = (event, range) => {
    const ranges = ["Aggressive", "Balanced", "Cautious"];
    if (range != null) {
      this.onThresChange(event, this.getRec(ranges[range]));
    }
  };

  onTextChange = (event) => {
    this.onThresChange(
      event,
      event.target.value ? Number((event.target.value / 100).toFixed(2)) : null
    );
  };

  getData = () => {
    function getObject(array) {
      var newArray = {};
      var arrayIdx = 0;
      var i = 0.01;

      while (i < 1 && arrayIdx < array.length) {
        if (array[arrayIdx] && i - array[arrayIdx]["threshold"] < 0.000001) {
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
          i = Number.parseFloat(Number.parseFloat(i + 0.01).toFixed(2));
        }
        arrayIdx = arrayIdx + 1;
      }
      return newArray;
    }

    axios
      .get(
        "https://ores.wikimedia.org/v3/scores/enwiki/?models=damaging|goodfaith&model_info=statistics.thresholds.true"
      )
      .then((res) => {
        const damagingArray =
          res.data.enwiki.models.damaging.statistics.thresholds.true;
        const goodfaithArray =
          res.data.enwiki.models.goodfaith.statistics.thresholds.true;
        console.log("got data");
        this.setState({
          damagingData: getObject(damagingArray),
          goodfaithData: getObject(goodfaithArray),
        });
      });
  };

  getRecommendations() {
    const models = ["damaging", "goodfaith"];
    const ranges = [
      { type: "Aggressive", param: '"maximum precision @ recall >= 0.9"' },
      { type: "Cautious", param: '"maximum recall @ precision >= 0.9"' },
    ];
    var rec = {
      damaging: { Aggressive: null, Cautious: null, Balanced: null },
      goodfaith: { Aggressive: null, Cautious: null, Balanced: null },
    };

    for (const i in models) {
      for (const j in ranges) {
        axios
          .get(
            "https://ores.wikimedia.org/v3/scores/enwiki/?models=" +
              models[i] +
              "&model_info=statistics.thresholds.true." +
              ranges[j].param
          )
          .then((res) => {
            rec[models[i]][ranges[j].type] = Number.parseFloat(
              res.data.enwiki.models[
                models[i]
              ].statistics.thresholds.true[0].threshold.toFixed(2)
            );
          });
      }
      rec[models[i]]["Balanced"] = models[i] === "damaging" ? 0.63 : 0.5;
    }
    console.log(rec);
    this.setState({ recommendations: rec });
    this.state.recommendations = rec;
    return rec;
  }

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

  getRec(range) {
    let rec = this.state.recommendations;
    if (rec == null)
      rec = {
        damaging: { Aggressive: 0.1, Cautious: 0.63, Balanced: 0.94 },
        goodfaith: { Aggressive: 0.85, Cautious: 0.5, Balanced: 0.05 },
      };
    const mod = this.state.damaging ? "damaging" : "goodfaith";
    return rec[mod][range];
  }

  componentDidMount() {
    this.getData();
    this.getRecommendations();
    this.setState({
      damaging: true,
      threshold: null,
      range: -1,
    });
  }

  render() {
    const borderColor = this.state.threshold ? "#3777a5" : "#ddd";
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
                  ].map((text) => (
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
          <div
            style={{
              display: "inline-flex",
              width: "80%",
              height: "77vh",
              alignItems: "center",
              justifyContent: "center",
              margin: "0% 10%",
            }}
          >
            <ToggleButtonGroup
              orientation="vertical"
              exclusive
              value={this.state.range}
              onChange={this.onRangeChange}
              style={{
                display: "flex",
                width: 400,
                flexDirection: "column",
                textAlign: "center",
                alignItems: "center",
                justifyContent: "space-evenly",
                height: "100%",
                margin: 0,
              }}
            >
              {[
                {
                  type: "Aggressive",
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
                  subtitle: "Tools for human reviewers",
                  description:
                    "Similar rates of uncaught " +
                    message +
                    " edits and falsely predicted " +
                    opposite +
                    " edits.",
                },
                {
                  type: "Cautious",
                  subtitle: "Automated bots",
                  description:
                    "Less falsely predicted " +
                    opposite +
                    " edits at the cost of more uncaught " +
                    message +
                    " edits.",
                },
              ].map((obj, index) => (
                <ToggleButton value={index} className="recommendOptions">
                  <Grid
                    container
                    spacing={0}
                    style={{
                      display: "flex",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <Grid
                      item
                      xs={6}
                      style={{
                        marginRight: 15,
                        display: "flex",

                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <h4>{obj.type} Model</h4>
                        <h5>{obj.subtitle}</h5>
                      </div>

                      <p>{obj.description}</p>
                    </Grid>
                    <Grid item xs={5}>
                      <img
                        src={
                          process.env.PUBLIC_URL +
                          "/recommender/" +
                          obj.type +
                          ".svg"
                        }
                        alt={obj.type + " model graphic."}
                        height="100%"
                        width="100%"
                      />
                    </Grid>
                  </Grid>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {["Aggressive", "Balanced", "Cautious"].map((type, index) => {
                return (
                  <div>
                    <img
                      src={
                        process.env.PUBLIC_URL +
                        "/recommender/" +
                        type +
                        (this.state.range === index ? "Active" : "Inactive") +
                        ".svg"
                      }
                      alt=""
                    />
                  </div>
                );
              })}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 0,
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
                      ? (this.state.threshold * 100).toFixed(0)
                      : null
                  }
                  onChange={this.onTextChange}
                  helperText={"N/A"}
                  inputProps={{
                    step: 1,
                    min: 1,
                    max: 98,
                    type: "number",
                    placeholder: "n/a",
                  }}
                  endAdornment={
                    <InputAdornment position="end">
                      <Typography
                        variant="h6"
                        className="text"
                        style={{ fontSize: 50, fontWeight: 600 }}
                      >
                        %
                      </Typography>
                    </InputAdornment>
                  }
                  style={{ fontSize: 50, width: 150, fontWeight: 600 }}
                />
                <Typography variant="body2">
                  This threshold will catch around
                  <strong>
                    {" "}
                    {this.getProp("recall", "--") === "--"
                      ? "--"
                      : (this.getProp("recall", "--") * 100).toFixed(0)}
                    %{" "}
                  </strong>
                  of the {" " + message} edits while having
                  <strong>
                    {" "}
                    {this.getProp("fpr", "--") === "--"
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
                    <div
                      style={{
                        textAlign: "left",
                        wordWrap: "break-word",
                        fontFamily: "monospace",
                      }}
                    >
                      <div
                        style={{
                          margin: 5,
                          fontWeight: "bold",
                        }}
                      >
                        def compute_metrics(y_true, y_pred_scores,{" "}
                        {this.state.threshold}, model="
                        {this.state.damaging ? "damaging" : "goodfaith"}"):
                      </div>
                      {[
                        "# model = damaging or goodfaith",
                        "# return a dictionary with metrics",
                        "# y_true: a np array of true labels 1/0",
                        "# y_pred_scores: a np array of predictions",
                      ].map((text, index) => (
                        <div style={{ margin: 5 }}>
                          {"  "}
                          {text}
                        </div>
                      ))}
                    </div>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Recommender;

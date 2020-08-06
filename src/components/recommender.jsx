import React, { Component } from "react";
import Metric from "../partials/metric";
import Typography from "@material-ui/core/Typography";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  LinearProgress,
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
    if (type != null) this.setState({ damaging: type });
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
    if (range != null) this.onThresChange(event, this.getRec(ranges[range]));
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
            fnr: (1 - elem["recall"]).toFixed(3),
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

  async getRecommendations() {
    const models = ["damaging", "goodfaith"];
    const ranges = [
      { type: "Aggressive", param: '"maximum precision @ recall >= 0.9"' },
      { type: "Cautious", param: '"maximum recall @ precision >= 0.9"' },
      { type: "Balanced", param: '"maximum precision @ recall >= 0.5"' },
    ];
    var rec = {
      damaging: { Aggressive: null, Cautious: null, Balanced: null },
      goodfaith: { Aggressive: null, Cautious: null, Balanced: null },
    };

    for (const i in models) {
      for (const j in ranges) {
        await axios
          .get(
            "https://ores.wikimedia.org/v3/scores/enwiki/?models=" +
              models[i] +
              "&model_info=statistics.thresholds.true." +
              ranges[j].param
          )
          .then((res) => {
            rec[models[i]][ranges[j].type] = Number.parseFloat(
              Math.max(
                Math.min(
                  res.data.enwiki.models[
                    models[i]
                  ].statistics.thresholds.true[0].threshold.toFixed(2),
                  0.98
                ),
                0.01
              )
            );
          });
      }
      console.log(rec[models[i]]["Balanced"]);
      if (
        (rec[models[i]]["Balanced"] > rec[models[i]]["Aggressive"] &&
          rec[models[i]]["Balanced"] > rec[models[i]]["Cautious"]) ||
        (rec[models[i]]["Balanced"] < rec[models[i]]["Aggressive"] &&
          rec[models[i]]["Balanced"] < rec[models[i]]["Cautious"])
      ) {
        console.log(rec[models[i]]["Balanced"]);
        rec[models[i]]["Balanced"] = Number.parseFloat(
          (
            (rec[models[i]]["Aggressive"] + rec[models[i]]["Cautious"]) /
            2
          ).toFixed(2)
        );
        console.log(rec[models[i]]["Balanced"]);
      }
    }
    console.log(rec);
    this.setState({ recommendations: rec });
    this.state.recommendations = rec;
    return rec;
  }

  getProp(prop, escape) {
    if (
      this.state.damagingData &&
      this.state.goodfaithData &&
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
    this.setState({ damaging: true, threshold: null, range: -1 });
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
          <Grid container spacing={0} className="upperSettings">
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
                padding: 0,
                paddingLeft: 10,
                paddingBottom: 10,
                borderLeft: "1px solid #d3d3d3",
                display: "flex",
                flexDirection: "column",
                alignItems: "left",
              }}
            >
              <Typography component="div" variant="subtitle2">
                <Box>Additional Information</Box>
              </Typography>
              <div className="customLink" style={{ width: 410, marginTop: 7 }}>
                <a
                  href="https://www.mediawiki.org/wiki/ORES/Thresholds"
                  target="_blank"
                  style={{ textTransform: "none" }}
                >
                  Click here to Learn More about ORES and Thresholds
                </a>
                <div>&#10142;</div>
              </div>
            </Grid>
          </Grid>
          {!this.state.goodfaithData && (
            <LinearProgress className="myProgress" />
          )}
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
            {/* Toggle for Model Options */}
            <div
              style={{
                height: "80%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <p style={{ margin: 10, width: "100%" }}>
                <strong>Step 1: </strong>Choose a model
              </p>
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
                  justifyContent: "space-between",
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
                  <ToggleButton
                    value={index}
                    className="recommendOptions"
                    disabled={
                      this.state.damaging
                        ? !this.state.damagingData
                        : !this.state.goodfaithData
                    }
                  >
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
            </div>
            {/* Arrows */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                marginTop: 50,
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
            {/* Performance Card */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 0,
              }}
            >
              <p style={{ margin: 10, width: "100%" }}>
                <strong>Step 2: </strong>Adjust the threshold
              </p>
              <div className="card" style={{ borderColor: borderColor }}>
                <Typography
                  component="div"
                  variant="subtitle2"
                  style={{ fontSize: 14, color: "#000", margin: 0 }}
                >
                  SUGGESTED THRESHOLD
                </Typography>
                <Input
                  value={
                    this.state.threshold
                      ? (this.state.threshold * 100).toFixed(0)
                      : null
                  }
                  onChange={this.onTextChange}
                  inputProps={{
                    step: 1,
                    min: 1,
                    max: 98,
                    type: "number",
                    placeholder: "N/A",
                  }}
                  endAdornment={
                    <InputAdornment position="end">
                      <Typography
                        variant="h6"
                        className="text"
                        style={{ fontSize: 50, fontWeight: 600 }}
                      >
                        {this.state.threshold ? "%" : ""}
                      </Typography>
                    </InputAdornment>
                  }
                  style={{
                    fontSize: 50,
                    width: 150,
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
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
                    <Typography
                      variant="h5"
                      style={{
                        color: this.state.threshold ? "#3777a5" : "grey",
                      }}
                    >
                      See Specific Performance
                    </Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <div>
                      {[
                        // {
                        //   prop: "!precision",
                        //   desc:
                        //     "% of correctly predicted " + opposite + " edits",
                        // },
                        // {
                        //   prop: "!recall",
                        //   desc:
                        //     "% of " + opposite + " edits correctly predicted",
                        // },
                        // {
                        //   prop: "!f1",
                        //   desc: "harmonic mean of !precision and !recall",
                        // },
                        {
                          prop: "accuracy",
                          desc: "ratio of correctly predicted data to all data",
                        },
                        // {
                        //   prop: "f1",
                        //   desc: "harmonic mean of precision & recall",
                        // },
                        // {
                        //   prop: "filter_rate",
                        //   desc: "% of observations predicted as " + opposite,
                        // },
                        {
                          prop: "fpr",
                          desc:
                            "% of " +
                            opposite +
                            " edits falsely caught as " +
                            message,
                        },
                        {
                          prop: "fnr",
                          desc:
                            "% of " +
                            message +
                            " edits that won't be identified",
                        },
                      ].map((obj) => (
                        <Metric
                          title={obj.prop}
                          value={this.getProp(obj.prop, "N/A")}
                          desc={obj.desc}
                          key={obj.prop}
                          accent={this.state.threshold ? "#C57619" : "grey"}
                        />
                      ))}
                    </div>
                  </ExpansionPanelDetails>
                </ExpansionPanel>

                <ExpansionPanel style={{ marginTop: 5 }}>
                  <ExpansionPanelSummary>
                    <Typography
                      variant="h5"
                      style={{
                        color: this.state.threshold ? "#3777a5" : "grey",
                      }}
                    >
                      Copy Code for this Threshold
                    </Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <div
                      style={{
                        wordWrap: "break-word",
                        fontFamily: "monospace",
                      }}
                    >
                      <div style={{ margin: 5, fontWeight: "bold" }}>
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

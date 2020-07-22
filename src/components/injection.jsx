import React, { Component } from "react";
import * as d3 from "d3";
import Typography from "@material-ui/core/Typography";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Slider from "@material-ui/core/Slider";
import ThresholdInput from "../partials/thresholdInput";

/* Object Format (for oldData & newData):
    {
        damaging: <DAMAGING TRUE>,
        goodfaith: <GOODFAITH TRUE>,
        features: <FEATURES OBJECT>
    } */
class FeatureInjector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      damaging: 0.5,
      goodfaith: 0.5,
      curID: null,
      oldData: null,
      newData: null,
      group: 1,
      adjSeconds: null,
      anon: null,
    };
  }

  componentDidMount() {
    this.setState({
      damaging: 0.5,
      goodfaith: 0.5,
      curID: null,
      group: 0,
      adjSeconds: null,
    });
  }

  onDamagingChange = (event) => {
    if (event.target.value != null) {
      let val = (event.target.value / 100).toFixed(2);
      console.log(event.target.value, val);
      this.setState({ damaging: val });
    }
  };

  onGoodfaithChange = (event) => {
    if (event.target.value != null) {
      let val = (event.target.value / 100).toFixed(2);
      console.log(event.target.value, val);
      this.setState({ goodfaith: val });
    }
  };

  onHighlightChange = (event, type) => {
    if (type != null) {
      this.setState({ group: type });
    }
  };

  onSliderChange = (event, value) => {
    if (value != null) {
      this.setState({
        adjSeconds: value,
        anon: value === 0,
      });
    }
  };

  renderPieChart(title, damaging, score, prev = null) {
    const positive =
      score > (damaging ? this.state.damaging : this.state.goodfaith);

    const prediction = damaging
      ? positive
        ? "Damaging"
        : "Not Damaging"
      : positive
      ? "Good Faith"
      : "Bad Faith";

    var pie = d3
      .pie()
      .sort(null)
      .value((d) => d.value);

    var arc = d3.arc().innerRadius(0).outerRadius(40);

    var data = [
      { name: "main", value: score != null ? score : 0 },
      { name: "other", value: 1 - score },
    ];

    function pieChartColor(name) {
      return name === "main" ? mainColor("green") : "lightgrey";
    }

    function mainColor(theDefault) {
      return score != null ? (prev != null ? theDefault : "grey") : "lightgrey";
    }

    d3.select(
      ".pieChart." + title.replace(/\s/g, "") + damaging + " svg"
    ).remove();

    let chart = d3
      .select(".pieChart." + title.replace(/\s/g, "") + damaging)
      .append("svg")
      .attr("viewBox", [-40, -40, 80, 80])
      .attr("z-level", 3);

    const arcs = pie(data);

    chart
      .append("g")
      .selectAll("path")
      .data(arcs)
      .join("path")
      .attr("fill", (d) => pieChartColor(d.data.name))
      .attr("d", arc);

    return (
      <div class="pieChartElem">
        <Typography variant="h6">{title}</Typography>
        <div class="mainContainer">
          <div class={"pieChart " + title.replace(/\s/g, "") + damaging} />
          <div class="rightSide">
            <div class="scoreBox">
              <h3 style={{ color: mainColor("#444") }}>
                {score != null ? score.toFixed(2) : "N/A"}
              </h3>
              {prev != null && score != null && score !== prev ? (
                <h6 style={{ color: "blue" }}>
                  {score > prev ? "\u25b2 " : "\u25bc "}
                  {Math.abs(score - prev).toFixed(2)}
                </h6>
              ) : null}
            </div>
            {score != null ? (
              <Typography
                variant="body1"
                style={{
                  color: prev != null ? "black" : "grey",
                  marginRight: 0,
                }}
              >
                Predicted as{" "}
                <span
                  style={{
                    color:
                      prev != null
                        ? damaging === positive
                          ? "red"
                          : "green"
                        : "grey",
                    margin: 0,
                  }}
                >
                  {prediction}
                </span>
              </Typography>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const marks = [
      { value: 0, label: "Anonymous" },
      { value: 1.577e8, label: "5 years" },
      { value: 3.154e8, label: "10 years" },
      { value: 4.73e8, label: "15 years" },
    ];

    return (
      <Grid container>
        {/* Disparity Highlighter */}
        <Grid
          item
          md={6}
          style={{
            padding: 10,
            paddingTop: 0,
            borderRight: "1px solid lightgrey",
            borderBottom: "none",
            paddingBottom: 0,
          }}
          className="upperSettings"
        >
          <Grid item xs={this.props.gridSize} className="modelOptions">
            <Typography component="div" variant="subtitle2">
              <Box>Highlight Edits</Box>
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={this.state.group}
              onChange={this.onHighlightChange}
              className="options"
              style={{ paddingBottom: 0 }}
              //   style={{ width: "90%", justifyContent: "space-between" }}
            >
              <Typography
                component={ToggleButton}
                value={1}
                variant="h6"
                className="text"
                style={{ fontSize: 20 }}
              >
                Newcomer / Experienced
              </Typography>
              <Typography
                value={2}
                component={ToggleButton}
                variant="h6"
                className="text"
                style={{ fontSize: 20 }}
              >
                Anonymous / Logged-In
              </Typography>
              <Typography
                value={0}
                component={ToggleButton}
                variant="h6"
                className="text"
                style={{ fontSize: 20 }}
              >
                None
              </Typography>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
        {/* Damaging & Goodfaith Inputs */}
        <Grid item md={6} style={{ padding: 10, paddingTop: 0 }}>
          <Typography variant="subtitle2">Threshold Settings</Typography>
          <Grid container>
            <Grid
              item
              md={6}
              style={{ display: "inline-flex", justifyContent: "center" }}
            >
              <h3 style={{ margin: 10, marginRight: 30, fontWeight: 500 }}>
                Damaging:{" "}
              </h3>
              <ThresholdInput
                value={this.state.damaging}
                multiplier={100}
                onChange={this.onDamagingChange}
              />
            </Grid>
            <Grid
              item
              md={6}
              style={{ display: "inline-flex", justifyContent: "center" }}
            >
              <h3 style={{ margin: 10, marginRight: 30, fontWeight: 500 }}>
                Goodfaith:{" "}
              </h3>
              <ThresholdInput
                value={this.state.goodfaith}
                multiplier={100}
                onChange={this.onGoodfaithChange}
              />
            </Grid>
          </Grid>
        </Grid>
        {/* Graph + Slider */}
        <Grid
          item
          md={6}
          style={{
            padding: 10,
            paddingTop: 0,
            borderTop: "1px solid lightgrey",
            borderRight: "1px solid lightgrey",
          }}
        >
          <Typography variant="subtitle2">Edit Data Point</Typography>

          <Slider
            style={{ margin: "0 5%", marginTop: 30, width: "90%" }}
            max={5e8}
            marks={marks}
            onChange={this.onSliderChange}
            value={this.state.adjSeconds}
          />
          <div class="injectionGraph" />
        </Grid>
        {/* Pie Charts */}
        <Grid
          item
          md={6}
          style={{
            padding: 10,
            paddingTop: 0,
            borderTop: "1px solid lightgrey",
          }}
        >
          <Typography variant="subtitle2">Performance</Typography>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              margin: "0 3%",
              marginTop: 10,
            }}
          >
            {this.state.curID == null ? (
              <div className="legendCard" style={{ padding: 5 }}>
                <h3 style={{ margin: 10, fontWeight: 500 }}>
                  No data point is currently selected
                </h3>
              </div>
            ) : null}

            <h3
              style={{
                color: this.state.curID == null ? "grey" : "black",
                marginTop: 60,
              }}
            >
              Damaging Score
            </h3>
            <div style={{ display: "inline-flex" }}>
              {this.renderPieChart("New Score", true, 0.67, 0.79)}
              {this.renderPieChart("Original", true, 0.79)}
            </div>

            <h3
              style={{
                color: this.state.curID == null ? "grey" : "black",
                marginTop: 60,
              }}
            >
              Goodfaith Score
            </h3>
            <div style={{ display: "inline-flex" }}>
              {this.renderPieChart("New Score", false, null, 0.31)}
              {this.renderPieChart("Original", false, 0.31)}
            </div>
          </div>
        </Grid>
      </Grid>
    );
  }
}

export default FeatureInjector;

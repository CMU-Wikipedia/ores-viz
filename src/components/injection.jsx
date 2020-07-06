import React, { Component } from "react";
import * as d3 from "d3";
import Typography from "@material-ui/core/Typography";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input";
import axios from "axios";

/*
    Object Format (for oldData & newData):
    {
        damaging: <DAMAGING TRUE>,
        goodfaith: <GOODFAITH TRUE>,
        features: <FEATURES OBJECT>
    }
 */

class FeatureInjector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      damaging: 0.5,
      goodfaith: 0.5,
      curID: null,
      oldData: null,
      newData: null,
    };
  }

  componentDidMount() {
    this.setState({
      damaging: 0.5,
      goodfaith: 0.5,
      curID: null,
    });
  }

  onDamagingChange = (event) => {
    if (event.target.value != null) {
      this.setState({ damaging: event.target.value });
    }
  };

  onGoodfaithChange = (event) => {
    if (event.target.value != null) {
      this.setState({ goodfaith: event.target.value });
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
      return name == "main" ? mainColor("green") : "lightgrey";
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
    console.log(arcs);

    chart
      .append("g")
      .selectAll("path")
      .data(arcs)
      .join("path")
      .attr("fill", (d) => pieChartColor(d.data.name))
      .attr("d", arc);

    return (
      <div class="pieChartElem">
        <h5 class="upperTitle" style={{ fontWeight: "bold" }}>
          {title}
        </h5>
        <div class="mainContainer">
          <div class={"pieChart " + title.replace(/\s/g, "") + damaging} />
          <div class="rightSide">
            <div class="scoreBox">
              <h3 style={{ color: mainColor("#444") }}>
                {score != null ? score.toFixed(2) : "N/A"}
              </h3>
              {prev != null && score != null && score != prev ? (
                <h6 style={{ color: "blue" }}>
                  {score > prev ? "\u25b2 " : "\u25bc "}
                  {Math.abs(score - prev).toFixed(2)}
                </h6>
              ) : null}
            </div>
            {score != null ? (
              <h5
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
              </h5>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  render() {
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
          }}
        >
          <Typography variant="subtitle2">Highlight Edits</Typography>
        </Grid>
        {/* Damaging & Goodfaith Inputs */}
        <Grid item md={6} style={{ padding: 10, paddingTop: 0 }}>
          <Typography variant="subtitle2">Threshold Settings</Typography>
          <Grid container>
            <Grid
              item
              md={6}
              style={{ display: "inline-flex", justifyContent: "space-evenly" }}
            >
              <h3 style={{ margin: 10, fontWeight: 500 }}>Damaging: </h3>
              <Input
                value={this.state.damaging}
                onChange={this.onDamagingChange}
                inputProps={{ step: 0.01, min: 0, max: 1, type: "number" }}
                style={{ fontSize: 24, width: 70, alignSelf: "center" }}
              />
            </Grid>
            <Grid
              item
              md={6}
              style={{ display: "inline-flex", justifyContent: "space-evenly" }}
            >
              <h3 style={{ margin: 10, fontWeight: 500 }}>Goodfaith: </h3>
              <Input
                value={this.state.goodfaith}
                onChange={this.onGoodfaithChange}
                inputProps={{ step: 0.01, min: 0, max: 1, type: "number" }}
                style={{ fontSize: 24, width: 70, alignSelf: "center" }}
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
            }}
          >
            {this.state.curID == null ? (
              <div className="legendCard" style={{ padding: 5 }}>
                <h3 style={{ margin: 10, fontWeight: 500 }}>
                  No data point is currently selected
                </h3>
              </div>
            ) : null}

            <h3 style={{ color: this.state.curID == null ? "grey" : "black" }}>
              Damaging Score
            </h3>
            <div style={{ display: "inline-flex" }}>
              {this.renderPieChart("New Score", true, 0.67, 0.79)}
              {this.renderPieChart("Original", true, 0.79)}
            </div>

            <h3 style={{ color: this.state.curID == null ? "grey" : "black" }}>
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

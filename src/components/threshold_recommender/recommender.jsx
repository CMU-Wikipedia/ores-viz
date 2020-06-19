import React, { Component } from "react";
import * as d3 from "d3";
import Typography from "@material-ui/core/Typography";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
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
          <Grid container spacing={0}>
            <Grid item xs={5}>
              <ToggleButtonGroup
                orientation="vertical"
                exclusive
                value={this.state.threshold}
                onChange={this.onThresChange}
              >
                <ToggleButton value={0.12}>Aggressive</ToggleButton>
                <ToggleButton value={0.5}>Balanced</ToggleButton>
                <ToggleButton value={0.8}>Cautious</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={7}>
              <Input
                value={
                  this.state.threshold ? this.state.threshold.toFixed(2) : "N/A"
                }
                onChange={this.onTextChange}
                inputProps={{ step: 0.01, min: 0, max: 1, type: "number" }}
              />
            </Grid>
          </Grid>
        </div>
      </React.Fragment>
    );
  }
}

export default Recommender;

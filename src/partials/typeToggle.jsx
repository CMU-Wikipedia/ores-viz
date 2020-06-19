import React, { Component } from "react";
import * as d3 from "d3";
import Typography from "@material-ui/core/Typography";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";

class TypeToggle extends Component {
  render() {
    return (
      <Grid item xs={this.props.gridSize} className="modelOptions">
        <Typography component="div" variant="subtitle2">
          <Box>MODEL OPTIONS</Box>
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={this.props.damaging}
          onChange={this.props.onChange}
          className="options"
        >
          <Typography
            component={ToggleButton}
            value={true}
            variant="h6"
            className="text"
          >
            Damaging Model
          </Typography>
          <Typography
            value={false}
            component={ToggleButton}
            variant="h6"
            className="text"
          >
            GoodFaith Model
          </Typography>
        </ToggleButtonGroup>
      </Grid>
    );
  }
}

export default TypeToggle;

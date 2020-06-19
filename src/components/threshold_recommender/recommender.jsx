import React, { Component } from "react";
import * as d3 from "d3";
import Typography from "@material-ui/core/Typography";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";

class Recommender extends Component {
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
    this.state = {
      damaging: true,
    };
  }

  onTypeChange = (event, type) => {
    if (type != null) {
      this.setState({ damaging: type });
      this.state.damaging = type;
    }
  };

  componentDidMount() {
    this.setState({
      damaging: true,
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
              <Grid item xs={4} className="modelOptions">
                <Typography component="div" variant="subtitle2">
                  <Box>MODEL OPTIONS</Box>
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={this.state.damaging}
                  onChange={this.onTypeChange}
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
                  {/* </Grid>
                  <Grid item xs={6}> */}
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
        </div>
      </React.Fragment>
    );
  }
}

export default Recommender;

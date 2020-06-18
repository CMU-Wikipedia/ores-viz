import React, { Component } from "react";
import * as d3 from "d3";
import ThresholdSlider from "../../partials/slider";
import ThresholdPerformance from "./threshold_performance";
import Typography from "@material-ui/core/Typography";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Circle, { Cross } from "../../partials/shape";

class ThresholdExplorer extends Component {
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
    this.getWidth = this.getWidth.bind(this);
    this.drawChart = this.drawChart.bind(this);
    this.redrawChart = this.redrawChart.bind(this);
    this.state = {
      threshold: 60,
      width: 1000,
      height: 1000,
      widthHeightRatio: 0.8,
      graph1Scale: 1,
      dotWidth: 0,
      sliderRange: [20, 1000],
      damaging: true,
    };
  }

  getWidth() {
    if (this.chartRef.current == null) {
      return this.state.width;
    } else {
      return this.chartRef.current.parentElement.offsetWidth;
    }
  }

  onSliderChange = (event, threshold) => {
    this.setState({
      threshold: threshold,
    });
    d3.select(".rowChart svg").remove();
    this.drawChart = this.drawChart.bind(this);
    this.drawChart();
  };

  onTypeChange = (event, type) => {
    if (type != null) {
      this.setState({ damaging: type });
      this.state.damaging = type;
      d3.select(".rowChart svg").remove();
      this.drawChart = this.drawChart.bind(this);
      this.drawChart();
    }
  };

  componentDidMount() {
    let width = this.getWidth();
    let height = width * 0.8;
    let sliderRight = width - 30;

    this.setState(
      {
        width: width,
        height: height,
        sliderRange: [10, sliderRight],
        damaging: true,
      },
      () => {
        this.drawChart();
      }
    );

    let resizedFn;
    window.addEventListener("resize", () => {
      clearTimeout(resizedFn);
      resizedFn = setTimeout(() => {
        this.redrawChart();
      }, 200);
    });
  }

  redrawChart() {
    let width = this.getWidth();
    let sliderRight = width - 30;
    this.setState({
      width: width,
      height: width * 0.8,
      sliderRange: [10, sliderRight],
      damaging: this.state.damaging,
    });
    d3.select(".rowChart svg").remove();
    this.drawChart = this.drawChart.bind(this);
    this.drawChart();
  }

  drawChart() {
    const margin = { top: 0, right: 30, bottom: 30, left: 10 };
    let width = this.state.width - margin.left - margin.right;
    let height = this.state.height - margin.top - margin.bottom;
    // append the svg object to the body of the page
    let svg = d3
      .select(".rowChart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const threshold = this.state.threshold / 100;
    const graph1Scale = 1;

    const diameter = (width * graph1Scale) / 50;
    const dotWidth = diameter * 0.5;
    if (this.props.data != null) {
      const dd = dodge(
        threshold,
        this.props.data,
        diameter,
        this.state.damaging
      );

      const xAxis = (g) =>
        g
          .attr("transform", `translate(0,${margin.top})`)
          .call(d3.axisTop(x).ticks(0));

      const x = d3
        .scaleLinear()
        .domain([0, 1])
        .nice()
        .range([margin.left, width + margin.left]);

      // const shape = d3.scaleOrdinal (
      //   dd.map (d => d.category),
      //   d3.symbols.map (s =>
      //     d3.symbol ().size (diameter * diameter * 0.4).type (s) ()
      //   )
      // );

      function dodge(threshold, data, diameter, damaging) {
        const circles = data
          .map((d) => ({
            xvalue: parseFloat(
              damaging ? d.confidence_damage : d.confidence_faith
            ).toFixed(2),
            x:
              0.02 *
              Math.ceil(
                parseFloat(
                  damaging ? d.confidence_damage : d.confidence_faith
                ).toFixed(2) * 50
              ),
            correct:
              parseFloat(
                damaging ? d.confidence_damage : d.confidence_faith
              ).toFixed(2) >=
                threshold ==
              damaging
                ? d.damaging_label
                : d.faith_label,
            predict:
              parseFloat(
                damaging ? d.confidence_damage : d.confidence_faith
              ).toFixed(2) >= threshold,
            label: damaging ? d.damaging_label : d.faith_label,
          }))
          .sort(function (a, b) {
            if (a.x == b.x) {
              let ca = a.correct ? 1 : 0;
              let cb = b.correct ? 1 : 0;
              return cb - ca;
            } else {
              return b.x - a.x;
            }
          });
        const epsilon = 1e-4;

        let prev = 100;
        let cnt = 1;

        for (const b of circles) {
          //determine the position of the dot
          if (Math.abs(prev - b.x) < epsilon) {
            // belongs to the same col
            cnt += 1;
            b.y = diameter * cnt;
          } else {
            prev = b.x;
            cnt = 1;
            b.y = diameter;
          }

          if (b.correct) {
            b.category = 1;
          } else {
            b.category = 0;
          }

          if (b.predict) {
            b.color = d3.color("#C57619");
          } else {
            b.color = d3.color("#909090");
          }
        }

        return circles;
      }

      var customCross = {
        draw: function (context, size) {
          let s = Math.sqrt(size * 2) / 2;
          let w = Math.sqrt(size) / 6;
          context.moveTo(-s, w);
          context.lineTo(s, w);
          context.lineTo(s, -w);
          context.lineTo(-s, -w);
          context.closePath();
          context.moveTo(w, s);
          context.lineTo(w, -s);
          context.lineTo(-w, -s);
          context.lineTo(-w, s);
          context.closePath();
        },
      };

      // svg.append ('g').call (xAxis);

      svg
        .append("line")
        .attr("x1", width + margin.left - dotWidth * 100 * (1 - threshold))
        .attr("y1", margin.top)
        .attr("x2", width + margin.left - dotWidth * 100 * (1 - threshold))
        .attr("y2", height - 30)
        .attr("stroke-width", 2)
        .attr("stroke", "black")
        .style("stroke-dasharray", "5,5");

      const thresholdText = threshold * 100 + "%";
      svg
        .append("text")
        .attr("x", width + margin.left - dotWidth * 100 * (1 - threshold))
        .attr("y", height - 15)
        .attr("text-anchor", "middle")
        .text(thresholdText)
        .attr("font-family", "sans-serif")
        .attr("font-size", "15px");

      svg
        .append("g")
        .selectAll("path")
        .data(dd)
        .join("path")
        .attr(
          "transform",
          (d) => `translate(${x(d.x)},${d.y + margin.top}), rotate(45)`
        )
        .attr("fill", (d) => d.color)
        .attr(
          "d",
          d3
            .symbol()
            .type(function (d) {
              if (d.category === 0) {
                return customCross;
              } else {
                return d3.symbolCircle;
              }
            })
            .size(diameter * diameter * 0.4)
        );
    }
  }

  // shouldComponentUpdate (nextProps, nextState) {
  //   return (
  //     this.props.performance_data !== nextProps.performance_data ||
  //     this.state != nextState
  //   );
  // }

  render() {
    const message = this.state.damaging ? "damaging" : "good faith";
    const opposite = this.state.damaging ? "good" : "bad faith";
    return (
      <React.Fragment>
        <div
          style={{
            width: "55%",
            display: "inline-block",
            verticalAlign: "top",
            position: "relative",
          }}
        >
          <div className="upperSettings">
            <Grid container spacing={0}>
              <Grid item xs={9} className="modelOptions">
                <Typography component="div" variant="subtitle2">
                  <Box>MODEL OPTIONS</Box>
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={this.state.damaging}
                  onChange={this.onTypeChange}
                >
                  {/* <Grid container spacing={0} className="options">
                  <Grid item xs={6}> */}
                  <Typography
                    component={ToggleButton}
                    value={true}
                    // style={{
                    //   borderRight: "1px solid lightgrey",
                    //   fontWeight: "500",
                    // }}
                    variant="h6"
                    className="text"
                  >
                    Damaging Model
                  </Typography>
                  {/* </Grid>
                  <Grid item xs={6}> */}
                  <Typography
                    value={false}
                    // style={{
                    //   color: "grey",
                    // }}
                    component={ToggleButton}
                    variant="h6"
                    className="text"
                  >
                    GoodFaith Model
                  </Typography>
                  {/* </Grid>
                </Grid> */}
                </ToggleButtonGroup>
              </Grid>
              <Grid item xs={3} className="threshold">
                <div className="innerBox">
                  <Typography variant="subtitle2">
                    <Box>threshold</Box>
                  </Typography>

                  <Grid container spacing={2} className="options">
                    <Grid item xs={12}>
                      <Typography component="div" variant="h6" className="text">
                        {this.state.threshold} %
                      </Typography>
                    </Grid>
                  </Grid>
                </div>
              </Grid>
            </Grid>
          </div>

          <div
            style={{
              marginLeft: `${this.state.sliderRange[0]}px`,
              width: `${
                this.state.sliderRange[1] - this.state.sliderRange[0]
              }px`,
            }}
          >
            <Typography variant="subtitle2">VISUALIZATION</Typography>
            <ThresholdSlider
              defaultValue={60}
              onChangeCommitted={this.onSliderChange}
              color={"orange"}
            />
          </div>
          <div className="rowChart" ref={this.chartRef} />
          <div className="legendCard" id="explorerLegend">
            <Typography component="div" variant="subtitle2">
              legend
            </Typography>
            <Grid container spacing={0} style={{ marginTop: "10px" }}>
              <Grid item xs={12}>
                <div className="legendMark">
                  <Circle size={12} color="#909090" />{" "}
                  <Typography component="span" variant="body2">
                    Correctly classified {opposite} edits (TN)
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className="legendMark">
                  <Cross size={12} color="#909090" />{" "}
                  <Typography component="span" variant="body2">
                    Uncaught {message} edits (FN){" "}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className="legendMark">
                  <Circle size={12} color="#C57619" />{" "}
                  <Typography component="span" variant="body2">
                    Correctly classified {message} edits (TP)
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className="legendMark">
                  <Cross size={12} color="#C57619" />{" "}
                  <Typography component="span" variant="body2">
                    Mis-classified {opposite} edits (FP){" "}
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </div>
        </div>

        <div className="sidePanel">
          <Typography variant="subtitle2">PERFORMANCE</Typography>
          <ThresholdPerformance
            performance_data={this.props.performance_data}
            threshold={this.state.threshold}
            key={[this.state.damaging, this.state.threshold]}
            damaging={this.state.damaging}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default ThresholdExplorer;
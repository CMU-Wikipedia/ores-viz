import React, {Component} from 'react';
import * as d3 from 'd3';
import dotData from '../../data/new.json';
import ThresholdSlider from '../../partials/slider';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import ComparePerformance from './compare_performance';
import Grid from '@material-ui/core/Grid';

const getColor = (accuracy, defaultValue, currentValue) => {
  let perform = 1;
  if (accuracy) {
    if (defaultValue > currentValue) {
      perform = -1;
    } else if (defaultValue == currentValue) {
      perform = 0;
    } else {
      perform = 1;
    }
  } else {
    if (defaultValue > currentValue) {
      perform = 1;
    } else if (defaultValue == currentValue) {
      perform = 0;
    } else {
      perform = -1;
    }
  }
  //color for stroke
  if (perform == 1) {
    return d3.color ('#159256');
  } else if (perform == 0) {
    return d3.color ('#878787');
  } else {
    return d3.color ('#921515');
  }
};

const getPerformance = data => {
  const TP = data[0], TN = data[1], FP = data[2], FN = data[3];
  //accuracy:
  const acc = (TP + TN) / (TP + TN + FP + FN);
  const fpr = FP / (FP + TN);
  const fnr = FN / (FN + TP);
  return [acc, fpr, fnr];
};

class GroupCompareVisualizer extends Component {
  constructor (props) {
    super (props);
    this.visualizationRef = React.createRef ();
    this.compareChartRef = React.createRef ();
    this.comparePerformanceRef = React.createRef ();
    this.wholePerformanceRef = React.createRef ();
    this.getWidth = this.getWidth.bind (this);
    this.drawChart = this.drawChart.bind (this);
    this.redrawChart = this.redrawChart.bind (this);
    this.getWholePerformance = this.getWholePerformance.bind (this);
    this.getPerformanceWidth = this.getPerformanceWidth.bind (this);
    this.getPerformanceForThreshold = this.getPerformanceForThreshold.bind (
      this
    );
    this.state = {
      threshold: 60,
      width: 1000,
      height: 1000,
      performanceWidth: 1000,
      group1Color: '#C57619',
      group2Color: '#3777A5',
      sliderRange: [20, 1000],
      wholePerformance: [0, 0, 0],
      defaultPerformance: [0, 0, 0],
      anonPerformance: null,
      loggedPerformance: null,
    };
  }

  getWidth () {
    if (this.compareChartRef.current === null) {
      return this.state.width;
    } else {
      return this.compareChartRef.current.parentElement.offsetWidth;
    }
  }

  getPerformanceWidth () {
    if (this.comparePerformanceRef.current === null) {
      return this.state.performanceWidth;
    } else {
      return this.comparePerformanceRef.current.parentElement.offsetWidth;
    }
  }

  getPerformanceHeight () {
    if (
      this.wholePerformanceRef.current == null ||
      this.compareChartRef.current === null
    ) {
      return this.state.performanceHeight;
    } else {
      return (
        (this.compareChartRef.current.parentElement.offsetWidth - 60) * 0.5 +
        200 -
        this.wholePerformanceRef.current.offsetHeight
      );
    }
  }

  getPerformanceForThreshold () {
    const threshold = this.state.threshold * 0.01;
    if (this.props.anonData != null && this.props.loggedData != null) {
      const anonFP = this.props.anonData.filter (function (d) {
        return d.confidence_damage >= threshold && !d.damaging_label;
      }).length;

      const anonTP = this.props.anonData.filter (function (d) {
        return d.confidence_damage >= threshold && d.damaging_label;
      }).length;

      const anonFN = this.props.anonData.filter (function (d) {
        return d.confidence_damage < threshold && d.damaging_label;
      }).length;

      const anonTN = this.props.anonData.filter (function (d) {
        return d.confidence_damage < threshold && !d.damaging_label;
      }).length;

      const logFP = this.props.loggedData.filter (function (d) {
        return d.confidence_damage >= threshold && !d.damaging_label;
      }).length;

      const logTP = this.props.loggedData.filter (function (d) {
        return d.confidence_damage >= threshold && d.damaging_label;
      }).length;

      const logFN = this.props.loggedData.filter (function (d) {
        return d.confidence_damage < threshold && d.damaging_label;
      }).length;

      const logTN = this.props.loggedData.filter (function (d) {
        return d.confidence_damage < threshold && !d.damaging_label;
      }).length;
      return {
        anon: [anonTP, anonTN, anonFP, anonFN],
        logged: [logTP, logTN, logFP, logFN],
      };
    } else {
      return {
        anon: this.state.anonPerformance,
        Logged: this.state.loggedPerformance,
      };
    }
  }

  onSliderChange = (event, threshold) => {
    this.setState ({
      threshold: threshold,
    });

    this.getWholePerformance ();

    d3.select ('.compareChart svg').remove ();
    this.drawChart = this.drawChart.bind (this);
    this.drawChart ();
    d3.select ('.comparePerformance svg').remove ();
    this.drawPerformanceChart = this.drawPerformanceChart.bind (this);
    this.drawPerformanceChart ();
  };

  componentDidMount () {
    let width = this.getWidth ();
    let height = (width - 60) * 0.5;
    let performanceWidth = this.getPerformanceWidth ();
    let performanceHeight = this.getPerformanceHeight ();
    let sliderRight = width - 40;
    this.getWholePerformance ();
    let acc = 0;
    let fpr = 0;
    let fnr = 0;
    if (this.props.performanceData != null) {
      const data = this.props.performanceData;
      acc = data[50].damaging_accuracy * 100;
      fpr = 100 * data[50].damaging_fpr;
      fnr = 100 * data[50].damaging_fnr;
    }

    this.setState (
      {
        width: width,
        height: height,
        sliderRange: [10, sliderRight],
        performanceWidth: performanceWidth,
        performanceHeight: performanceHeight,
        defaultPerformance: [acc.toFixed (1), fpr.toFixed (1), fnr.toFixed (1)],
      },
      () => {
        this.drawChart ();
        this.drawPerformanceChart ();
      }
    );

    let resizedFn;
    window.addEventListener ('resize', () => {
      clearTimeout (resizedFn);
      resizedFn = setTimeout (() => {
        this.redrawChart ();
      }, 200);
    });
  }

  redrawChart () {
    let width = this.getWidth ();
    let performanceWidth = this.getPerformanceWidth ();
    let performanceHeight = this.getPerformanceHeight ();
    let sliderRight = width - 40;
    this.setState ({
      width: width,
      height: (width - 60) * 0.5,
      performanceWidth: performanceWidth,
      performanceHeight: performanceHeight,

      sliderRange: [10, sliderRight],
    });
    d3.select ('.compareChart svg').remove ();
    this.drawChart = this.drawChart.bind (this);
    this.drawChart ();
    d3.select ('.comparePerformance svg').remove ();
    this.drawPerformanceChart = this.drawPerformanceChart.bind (this);
    this.drawPerformanceChart ();
  }

  getWholePerformance () {
    if (
      this.props.performanceData != null &&
      this.props.anonData != null &&
      this.props.loggedData != null
    ) {
      const data = this.props.performanceData;
      const acc = data[this.state.threshold].damaging_accuracy * 100;
      const fpr = 100 * data[this.state.threshold].damaging_fpr;
      const fnr = 100 * data[this.state.threshold].damaging_fnr;
      const performance = this.getPerformanceForThreshold ();
      const anonPerf = performance.anon;
      const loggedPerf = performance.logged;

      this.setState ({
        wholePerformance: [acc.toFixed (1), fpr.toFixed (1), fnr.toFixed (1)],
        anonPerformance: anonPerf,
        loggedPerformance: loggedPerf,
      });
    }
  }
  drawPerformanceChart () {
    const margin = {top: 0, right: 20, bottom: 20, left: 0};
    let width = this.state.performanceWidth - margin.left - margin.right;
    let height = this.state.performanceHeight - margin.top - margin.bottom;
    let svg = d3
      .select ('.comparePerformance')
      .append ('svg')
      .attr ('width', width + margin.left + margin.right)
      .attr ('height', height + margin.top + margin.bottom);

    let blockHeight = height / 3;
    let vizHeight = blockHeight / 3;
    // TP, TN, FP, FN
    if (
      this.state.anonPerformance != null &&
      this.state.loggedPerformance != null
    ) {
      let anonPerformance = getPerformance (this.state.anonPerformance);
      let loggedPerformance = getPerformance (this.state.loggedPerformance);
      let wholePerformance = this.state.wholePerformance.map (function (perf) {
        return perf / 100;
      });
      const x = d3
        .scaleLinear ()
        .domain ([0, 1])
        .nice ()
        .range ([margin.left + width / 4, margin.left + width]);

      function drawPerformance (
        height,
        defaultPerformance,
        currentPerformance,
        color
      ) {
        const markHeight = 5;
        const markWidth = 6;
        svg
          .append ('line')
          .attr ('x1', margin.left + width / 4)
          .attr ('y1', height)
          .attr ('x2', margin.left + width)
          .attr ('y2', height)
          .attr ('stroke-width', 2)
          .attr ('stroke', 'grey');
        svg
          .append ('line')
          .attr ('x1', x (currentPerformance))
          .attr ('y1', height - markHeight)
          .attr ('x2', x (currentPerformance))
          .attr ('y2', height + markHeight)
          .attr ('stroke-width', markWidth)
          .attr ('stroke', color);

        svg
          .append ('line')
          .attr ('x1', x (defaultPerformance))
          .attr ('y1', height)
          .attr ('x2', x (currentPerformance))
          .attr ('y2', height)
          .attr ('stroke-width', 2)
          .attr ('stroke', color);
      }

      ['Accuracy', 'FPR', 'FNR'].forEach ((item, index) => {
        const anonHeight = blockHeight * index + vizHeight * 2;
        const loggedHeight = margin.top + blockHeight * index + vizHeight * 3;

        const markHeight = 5;
        const markWidth = 6;

        drawPerformance (
          anonHeight,
          wholePerformance[index],
          anonPerformance[index],
          d3.color (this.state.group1Color)
        );
        drawPerformance (
          loggedHeight,
          wholePerformance[index],
          loggedPerformance[index],
          d3.color (this.state.group2Color)
        );
        // svg
        //   .append ('line')
        //   .attr ('x1', margin.left + width / 4)
        //   .attr ('y1', anonHeight)
        //   .attr ('x2', margin.left + width)
        //   .attr ('y2', anonHeight)
        //   .attr ('stroke-width', 2)
        //   .attr ('stroke', 'black');
        // svg
        //   .append ('line')
        //   .attr ('x1', x (anonPerformance[index]))
        //   .attr ('y1', anonHeight - markHeight)
        //   .attr ('x2', x (anonPerformance[index]))
        //   .attr ('y2', anonHeight + markHeight)
        //   .attr ('stroke-width', markWidth)
        //   .attr ('stroke', 'red');

        // svg
        //   .append ('line')
        //   .attr ('x1', margin.left + width / 4)
        //   .attr ('y1', loggedHeight)
        //   .attr ('x2', margin.left + width)
        //   .attr ('y2', loggedHeight)
        //   .attr ('stroke-width', 2)
        //   .attr ('stroke', 'black');

        // svg
        //   .append ('line')
        //   .attr ('x1', x (loggedPerformance[index]))
        //   .attr ('y1', loggedHeight - markHeight)
        //   .attr ('x2', x (loggedPerformance[index]))
        //   .attr ('y2', loggedHeight + markHeight)
        //   .attr ('stroke-width', markWidth)
        //   .attr ('stroke', 'red');
      });
    }
  }

  drawChart () {
    const margin = {top: 0, right: 40, bottom: 0, left: 0};
    let width = this.state.width - margin.left - margin.right;
    let height = width / 2;
    // append the svg object to the body of the page
    let svg = d3
      .select ('.compareChart')
      .append ('svg')
      .attr ('width', width + margin.left + margin.right)
      .attr ('height', height);

    var customCross = {
      draw: function (context, size) {
        let s = Math.sqrt (size * 2) / 2;
        let w = Math.sqrt (size) / 6;
        context.moveTo (-s, w);
        context.lineTo (s, w);
        context.lineTo (s, -w);
        context.lineTo (-s, -w);
        context.closePath ();
        context.moveTo (w, s);
        context.lineTo (w, -s);
        context.lineTo (-w, -s);
        context.lineTo (-w, s);
        context.closePath ();
      },
    };

    const groupSize = width / 2;

    const pack = data =>
      d3.pack ().size ([groupSize - 2, groupSize - 2]).padding (3) (
        d3
          .hierarchy (data)
          .sum (d => d.value)
          .sort ((a, b) => b.value - a.value)
      );

    const threshold = this.state.threshold * 0.01;

    const app = this;

    if (
      this.props.anonData != null &&
      this.props.loggedData != null &&
      this.state.anonPerformance != null &&
      this.state.loggedPerformance != null
    ) {
      const anonPerf = this.state.anonPerformance;
      const loggedPerf = this.state.loggedPerformance;
      const anonTP = anonPerf[0],
        anonTN = anonPerf[1],
        anonFP = anonPerf[2],
        anonFN = anonPerf[3];
      const logTP = loggedPerf[0],
        logTN = loggedPerf[1],
        logFP = loggedPerf[2],
        logFN = loggedPerf[3];

      const dots = pack (dotData).children
        .slice (0, this.props.sliceNumber)
        .map (d => ({
          x: d.x,
          y: d.y,
          r: d.r,
          category: 'cross',
        }))
        .sort (function (a, b) {
          const centerX = margin.left + height;
          const centerY = height / 2 + margin.top;
          const distA = Math.sqrt (
            Math.pow (a.x - centerX, 2) + Math.pow (a.y - centerY, 2)
          );
          const distB = Math.sqrt (
            Math.pow (b.x - centerX, 2) + Math.pow (b.y - centerY, 2)
          );
          return distA - distB;
        });

      const dotRadius = dots[0].r;

      function getSymbolColor (color, fp, tp, fn, tn) {
        let dd = [];
        const cp = [fp, fp + tp, fp + tp + fn];
        dots.forEach (function (dot, index) {
          if (index < cp[0]) {
            dd.push ({
              //false positive
              x: dot.x,
              y: dot.y,
              category: 0,
              color: color,
            });
          } else if (index >= cp[0] && index < cp[1]) {
            dd.push ({
              //true positive
              x: dot.x,
              y: dot.y,
              category: 1,
              color: color,
            });
          } else if (index >= cp[1] && index < cp[2]) {
            dd.push ({
              //false negative
              x: dot.x,
              y: dot.y,
              category: 0,
              color: d3.color ('#909090'),
            });
          } else {
            dd.push ({
              //false positive
              x: dot.x,
              y: dot.y,
              category: 1,
              color: d3.color ('#909090'),
            });
          }
        });

        return dd;
      }
      let anonDots = getSymbolColor (
        d3.color (this.state.group1Color),
        anonFP,
        anonTP,
        anonFN,
        anonTN
      );
      let logDots = getSymbolColor (
        d3.color (this.state.group2Color),
        logFP,
        logTP,
        logFN,
        logTN
      );

      svg
        .append ('g')
        .selectAll ('path')
        .data (anonDots)
        .join ('path')
        .attr (
          'transform',
          d => `translate(${margin.left + d.x},${d.y}),rotate(45)`
        )
        .attr ('fill', d => d.color)
        .attr (
          'd',
          d3
            .symbol ()
            .type (function (d) {
              if (d.category == 0) {
                return customCross;
              } else {
                return d3.symbolCircle;
              }
            })
            .size (dotRadius * dotRadius * 1.5)
        );

      svg
        .append ('g')
        .selectAll ('path')
        .data (logDots)
        .join ('path')
        .attr (
          'transform',
          d => `translate(${margin.left + width / 2 + d.x},${d.y}),rotate(45)`
        )
        .attr ('fill', d => d.color)
        .attr (
          'd',
          d3
            .symbol ()
            .type (function (d) {
              if (d.category == 0) {
                return customCross;
              } else {
                return d3.symbolCircle;
              }
            })
            .size (dotRadius * dotRadius * 1.5)
        );
    }
  }

  render () {
    return (
      <React.Fragment>
        <div
          ref={this.visualizationRef}
          style={{
            width: '52%',
            display: 'inline-block',
            verticalAlign: 'top',
          }}
        >
          <div className="upperSettings">
            <Typography variant="subtitle2">
              <Box>
                MODEL OPTIONS
              </Box>

            </Typography>
          </div>
          <div
            style={{
              marginLeft: `${this.state.sliderRange[0]}px`,
              width: `${this.state.sliderRange[1] - this.state.sliderRange[0]}px`,
            }}
          >
            <ThresholdSlider
              defaultValue={60}
              onChangeCommitted={this.onSliderChange}
            />

          </div>
          <div className="compareChart" ref={this.compareChartRef} />
          <div
            style={{
              marginLeft: `${this.state.sliderRange[0]}px`,
              width: `${this.state.sliderRange[1] - this.state.sliderRange[0]}px`,
              transform: 'translate(0px,-20px)',
            }}
            ref={this.visualizationRef}
          >
            <div
              style={{
                width: '50%',
                display: 'inline-block',
                // transform: 'translate(0,0px)',
              }}
            >
              <Typography
                variant="h6"
                component="div"
                style={{
                  textAlign: 'center',
                  color: `${this.state.group1Color}`,
                }}
              >
                Anonymous Edits
              </Typography>
              <Typography
                variant="body2"
                component="div"
                style={{textAlign: 'center'}}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <Box width="80%">
                    Model performance on edits made by anonymous IP users
                  </Box>
                </div>
              </Typography>

            </div>
            <div
              style={{
                width: '50%',
                display: 'inline-block',
                // transform: 'translate(0,-10px)',
              }}
            >
              <Typography
                variant="h6"
                component="div"
                style={{
                  textAlign: 'center',
                  color: `${this.state.group2Color}`,
                }}
              >
                Logged-in Edits
              </Typography>

              <Typography
                variant="body2"
                component="div"
                style={{textAlign: 'center'}}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <Box width="80%">
                    Model performance on edits made by logged-in editors
                  </Box>
                </div>
              </Typography>

            </div>
          </div>
        </div>

        <div className="sidePanel">
          <div
            ref={this.wholePerformanceRef}
            style={{paddingBottom: '30px', borderBottom: '1px solid lightgrey'}}
          >
            <Typography component="div" variant="subtitle2">
              PERFORMANCE
            </Typography>
            <Grid
              container
              spacing={3}
              style={{marginTop: '5px', textAlign: 'left', marginLeft: '10px'}}
            >
              <Grid item xs={4}>
                <Typography
                  component="div"
                  style={{
                    fontWeight: 'bold',
                  }}
                >
                  Accuracy
                </Typography>
                <Typography
                  component="div"
                  className="compareWholePerformanceData"
                  style={{
                    color: `${getColor (true, this.state.defaultPerformance[0], this.state.wholePerformance[0])}`,
                  }}
                >
                  <Box className="compareWholePerformanceData">
                    {this.state.wholePerformance[0]}%
                  </Box>

                </Typography>

              </Grid>
              <Grid item xs={4}>
                <Typography component="div" style={{fontWeight: 'bold'}}>
                  FPR
                </Typography>
                <Typography
                  component="div"
                  style={{
                    color: `${getColor (true, this.state.defaultPerformance[1], this.state.wholePerformance[1])}`,
                  }}
                >
                  <Box className="compareWholePerformanceData">
                    {this.state.wholePerformance[1]}%
                  </Box>

                </Typography>

              </Grid>
              <Grid item xs={4}>
                <Typography component="div" style={{fontWeight: 'bold'}}>
                  FNR
                </Typography>
                <Typography
                  component="div"
                  style={{
                    color: `${getColor (true, this.state.defaultPerformance[2], this.state.wholePerformance[2])}`,
                  }}
                >
                  <Box className="compareWholePerformanceData">
                    {this.state.wholePerformance[2]}%
                  </Box>
                </Typography>
              </Grid>
            </Grid>
          </div>
          <div>
            <div style={{width: '20%', display: 'inline-block'}}>
              <div style={{height: `${this.state.performanceHeight / 3}px`}}>
                Accuracy
              </div>
              <div style={{height: `${this.state.performanceHeight / 3}px`}}>
                FPR
              </div>
              <div style={{height: `${this.state.performanceHeight / 3}px`}}>
                FNR
              </div>
            </div>
            <div style={{width: '80%', display: 'inline-block'}}>
              <div
                className="comparePerformance"
                ref={this.comparePerformanceRef}
              />
            </div>
          </div>

        </div>

      </React.Fragment>
    );
  }
}

export default GroupCompareVisualizer;

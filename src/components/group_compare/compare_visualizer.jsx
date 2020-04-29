import React, {Component} from 'react';
import * as d3 from 'd3';
import dotData from '../../data/new.json';
import ThresholdSlider from '../../partials/slider';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

class GroupCompareVisualizer extends Component {
  constructor (props) {
    super (props);

    this.compareChartRef = React.createRef ();
    this.getWidth = this.getWidth.bind (this);
    this.drawChart = this.drawChart.bind (this);
    this.redrawChart = this.redrawChart.bind (this);
    this.state = {
      threshold: 60,
      width: 1000,
      height: 1000,
      group1Color: '#C57619',
      group2Color: '#3777A5',
      sliderRange: [20, 1000],
    };
  }

  getWidth () {
    if (this.compareChartRef.current === null) {
      return this.state.width;
    } else {
      return this.compareChartRef.current.parentElement.offsetWidth;
    }
  }

  onSliderChange = (event, threshold) => {
    this.setState ({
      threshold: threshold,
    });
    this.redrawChart ();
  };

  componentDidMount () {
    let width = this.getWidth ();
    let height = (width - 60) * 0.5;
    let sliderRight = width - 30;

    this.setState (
      {
        width: width,
        height: height,
        sliderRange: [10, sliderRight],
      },
      () => {
        this.drawChart ();
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
    let sliderRight = width - 30;
    this.setState ({
      width: width,
      height: (width - 60) * 0.5,
      sliderRange: [10, sliderRight],
    });
    d3.select ('.compareChart svg').remove ();
    this.drawChart = this.drawChart.bind (this);
    this.drawChart ();
  }

  drawChart () {
    const margin = {top: 0, right: 20, bottom: 0, left: 0};
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
      // var symbol = d3.symbol ();

      // var dotD = svg
      //   .selectAll ('.shapes')
      //   .data (anonDots)
      //   .enter ()
      //   .append ('path');

      // dotD
      //   .attr ('d', d => getSymbol (d.category))
      //   .attr ('fill', d => d.color)
      //   .attr ('transform', d => `translate(${d.x},${d.y}),rotate(45)`);
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
      // svg
      //   .append ('g')
      //   .selectAll ('path')
      //   .data (dots)
      //   .join ('path')
      //   .attr (
      //     'transform',
      //     d => `translate(${width / 2 + d.x},${d.y}),rotate(45)`
      //   )
      //   .attr ('fill', 'blue')
      //   .attr ('d', d => shape ('cross'));
    }
  }

  // shouldComponentUpdate (nextProps, nextState) {
  //   return (
  //     this.props.performance_data !=== nextProps.performance_data ||
  //     this.state != nextState
  //   );
  // }

  render () {
    return (
      <React.Fragment>
        <div
          style={{
            width: '52%',
            display: 'inline-block',
            verticalAlign: 'top',
          }}
        >
          <div
            style={{
              borderBottom: '1px solid lightgrey',
              height: '50px',
              paddingLeft: '10px',
            }}
          >
            <Typography variant="subtitle2">MODEL OPTIONS</Typography>
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
          >
            <div
              style={{
                width: '50%',
                display: 'inline-block',
                transform: 'translate(0,-10px)',
              }}
            >
              <Typography
                variant="h6"
                style={{
                  textAlign: 'center',
                  color: `${this.state.group1Color}`,
                }}
              >
                Anonymous Edits
              </Typography>
              <Typography variant="body2" style={{textAlign: 'center'}}>
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
                transform: 'translate(0,-10px)',
              }}
            >
              <Typography
                variant="h6"
                style={{
                  textAlign: 'center',
                  color: `${this.state.group2Color}`,
                }}
              >
                Logged-in Edits
              </Typography>

              <Typography variant="body2" style={{textAlign: 'center'}}>
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

        <div
          style={{
            width: '43%',
            paddingLeft: '2%',

            borderLeft: '1px solid lightgrey',
            display: 'inline-block',
            verticalAlign: 'top',
          }}
        />

      </React.Fragment>
    );
  }
}

export default GroupCompareVisualizer;

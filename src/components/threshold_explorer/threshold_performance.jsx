import React, {Component} from 'react';
import * as d3 from 'd3';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';

class ThresholdPerformance extends Component {
  constructor (props) {
    super (props);
    this.chartPerformanceRef = React.createRef ();
    this.getBoxHeight = this.getBoxHeight.bind (this);
    this.getWidthHeightRatio = this.getWidthHeightRatio.bind (this);
    this.getMargin = this.getMargin.bind (this);
    this.getWidth = this.getWidth.bind (this);
    this.drawChart = this.drawChart.bind (this);
    this.redrawChart = this.redrawChart.bind (this);
    this.state = {
      threshold: 80,
      width: 1000,
      height: 1000,
    };
  }

  getWidthHeightRatio () {
    return 2.4;
  }

  getWidth () {
    if (this.chartPerformanceRef.current == null) {
      return this.state.width;
    } else {
      return this.chartPerformanceRef.current.parentElement.offsetWidth;
    }
  }

  getMargin () {
    return {
      top: 30,
      right: 5,
      bottom: 20,
      left: 30,
      inBetween: this.state.width * 0.2,
    };
  }
  componentDidMount () {
    let width = this.getWidth ();
    let height = width * this.getWidthHeightRatio ();

    this.setState (
      {
        width: width,
        height: height,
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
    this.setState ({width: width, height: width * this.getWidthHeightRatio ()});
    d3.select ('.performanceChart svg').remove ();
    this.drawChart = this.drawChart.bind (this);
    this.drawChart ();
  }

  drawChart () {
    if (this.props.performance_data != null) {
      const dataAccuracy = this.props.performance_data.map (d => ({
        threshold: d.threshold,
        value: Math.round (d.damaging_accuracy * 100),
      }));

      const dataFPR = this.props.performance_data.map (d => ({
        threshold: d.threshold,
        value: Math.round (d.damaging_fpr * 100),
      }));

      const dataFNR = this.props.performance_data.map (d => ({
        threshold: d.threshold,
        value: Math.round (d.damaging_fnr * 100),
      }));

      const dataCollection = [dataAccuracy, dataFPR, dataFNR];

      const margin = this.getMargin ();
      let width = this.state.width - margin.left - margin.right;
      let height = this.state.height - margin.top - margin.bottom;
      let eachHeight = (height - margin.inBetween * 2) / 3;

      const betweenThreshold = (x1, x2, number) => {
        return (number >= x1 && number <= x2) || (number <= x1 && number >= x2);
      };

      //   const xAxis = g =>
      //     g
      //       .attr ('transform', `translate(0,${height / 2})`)
      //       .call (d3.axisBottom (x).ticks (width / 80).tickSizeOuter (0));

      const getXAxis = (x, type) => {
        switch (type) {
          case 0:
            return function (g) {
              g
                .attr ('transform', `translate(0,${eachHeight + margin.top})`)
                .attr ('class', 'axisGreyY')
                .call (d3.axisBottom (x).tickSize (0));
            };
            break;
          case 1:
            return function (g) {
              g
                .attr (
                  'transform',
                  `translate(0,${eachHeight * 2 + margin.inBetween + margin.top})`
                )
                .attr ('class', 'axisGreyY')
                .call (d3.axisBottom (x).tickSize (0));
            };
            break;
          default:
            return function (g) {
              g
                .attr ('transform', `translate(0,${height + margin.top})`)
                .attr ('class', 'axisGreyY')
                .call (d3.axisBottom (x).tickSize (0));
            };
        }
      };

      //   const y = d3
      //     .scaleLinear ()
      //     .domain ([0, d3.max (data, d => d.value)])
      //     .nice ()
      //     .range ([height / 2, margin.top]);

      const getY = type => {
        switch (type) {
          case 0:
            return d3
              .scaleLinear ()
              .domain ([0, d3.max (dataCollection[0], d => d.value)])
              .nice ()
              .range ([eachHeight + margin.top, margin.top]);
            break;
          case 1:
            return d3
              .scaleLinear ()
              .domain ([0, d3.max (dataCollection[1], d => d.value)])
              .nice ()
              .range ([
                eachHeight * 2 + margin.inBetween + margin.top,
                eachHeight + margin.inBetween + margin.top,
              ]);
            break;
          default:
            return d3
              .scaleLinear ()
              .domain ([0, d3.max (dataCollection[2], d => d.value)])
              .nice ()
              .range ([
                height + margin.top,
                eachHeight * 2 + margin.inBetween * 2 + margin.top,
              ]);
        }
      };

      let svg = d3
        .select ('.performanceChart')
        .append ('svg')
        .attr ('width', width + margin.left + margin.right)
        .attr ('height', height + margin.top + margin.bottom);

      const getPerformanceColor = (type, perform) => {
        if (type == 'stroke') {
          //color for stroke
          if (perform == 1) {
            return d3.color ('#159256');
          } else if (perform == 0) {
            return d3.color ('#878787');
          } else {
            return d3.color ('#921515');
          }
        } else {
          //color for area
          if (perform == 1) {
            return d3.color ('#F0F7F4');
          } else if (perform == 0) {
            return d3.color ('#E8E8E8');
          } else {
            return d3.color ('#F7F0F0');
          }
        }
      };

      const getAreaColor = (type, preValue, currentValue) => {
        if (type == 0) {
          //accuracy -> the higher the better
          if (preValue < currentValue) {
            //green
            return getPerformanceColor ('area', 1);
          } else if (preValue > currentValue) {
            //red
            return getPerformanceColor ('area', -1);
          } else {
            return getPerformanceColor ('area', 0);
          }
        } else {
          //FPR, FNR -> the lower the better
          if (preValue < currentValue) {
            //green
            return getPerformanceColor ('area', -1);
          } else if (preValue > currentValue) {
            //red
            return getPerformanceColor ('area', 1);
          } else {
            return getPerformanceColor ('area', 0);
          }
        }
      };

      const getStrokeColor = (type, preValue, currentValue) => {
        if (type == 0) {
          //accuracy -> the higher the better
          if (preValue < currentValue) {
            //green
            return getPerformanceColor ('stroke', 1);
          } else if (preValue > currentValue) {
            //red
            return getPerformanceColor ('stroke', -1);
          } else {
            return getPerformanceColor ('stroke', 0);
          }
        } else {
          //FPR, FNR -> the lower the better
          if (preValue < currentValue) {
            //green
            return getPerformanceColor ('stroke', -1);
          } else if (preValue > currentValue) {
            //red
            return getPerformanceColor ('stroke', 1);
          } else {
            return getPerformanceColor ('stroke', 0);
          }
        }
      };

      dataCollection.forEach ((data, index) => {
        const defaultValue = data[50].value;
        const currentValue = data[this.props.threshold].value;
        const currentThreshold = this.props.threshold;
        const x = d3
          .scaleLinear ()
          .domain ([0, d3.max (data, d => d.threshold)])
          .nice ()
          .range ([margin.left, width - margin.right]);

        const y = getY (index);
        const xAxis = getXAxis (x, index);

        const yAxis = g =>
          g
            .attr ('transform', `translate(${margin.left},0)`)
            .attr ('class', 'axisGrey')
            .call (d3.axisLeft (y).ticks (2));

        const line = d3
          .line ()
          .defined (d => !isNaN (d.value))
          .x (d => x (d.threshold))
          .y (d => y (d.value));

        const area = d3
          .area ()
          .defined (d =>
            betweenThreshold (0.5, currentThreshold * 0.01, d.threshold)
          )
          .x (d => x (d.threshold))
          .y0 (y (0))
          .y1 (d => y (d.value));

        svg
          .append ('path')
          .datum (data.filter (area.defined ()))
          .attr ('fill', getAreaColor (index, defaultValue, currentValue))
          .attr ('d', area);

        svg
          .append ('path')
          .datum (data)
          .attr ('fill', 'none')
          .attr ('stroke', 'grey')
          .attr ('stroke-width', 1.5)
          .attr ('stroke-linejoin', 'round')
          .attr ('stroke-linecap', 'round')
          .attr ('d', line);

        svg
          .append ('line')
          .attr ('x1', x (currentThreshold * 0.01))
          .attr ('y1', y (currentValue))
          .attr ('x2', x (currentThreshold * 0.01))
          .attr (
            'y2',
            margin.top + index * margin.inBetween + (index + 1) * eachHeight
          )
          .attr ('stroke-width', 2)
          .attr ('stroke', getStrokeColor (index, defaultValue, currentValue))
          .style ('stroke-dasharray', '5,5');

        svg
          .append ('text')
          .attr ('x', x (currentThreshold * 0.01))
          .attr ('y', y (currentValue + 8))
          .attr ('text-anchor', 'middle')
          .text (`${currentValue}%`)
          .attr ('font-family', 'sans-serif')
          .attr ('font-size', '20px')
          .attr ('fill', getStrokeColor (index, defaultValue, currentValue));

        svg.append ('g').call (xAxis);

        svg.append ('g').call (yAxis);
      });
    }
  }

  getBoxHeight () {
    const margin = this.getMargin ();
    return (
      (this.state.height - margin.top - margin.bottom - margin.inBetween * 2) /
      3
    );
  }

  render () {
    return (
      <div style={{marginTop: '20px'}}>
        <div
          style={{
            width: '50%',
            display: 'inline-block',
            verticalAlign: 'top',
          }}
        >
          <div
            style={{marginTop: '20px'}}
            className="performanceChart"
            ref={this.chartPerformanceRef}
          />
        </div>
        <div
          style={{
            width: '50%',
            display: 'inline-block',
            verticalAlign: 'top',
          }}
        >
          <div
            style={{
              height: `${this.getBoxHeight ()}px`,
              padding: '0% 5%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              marginTop: `${this.getMargin ().top + 20}px`,
              marginBottom: `${this.getMargin ().inBetween}px`,
            }}
          >
            <div>
              <Typography variant="h6" textAlign="center">
                Accuracy{' '}
              </Typography>
              <Typography variant="body2">
                Correctly predicted edits out of all edits{' '}
              </Typography>
            </div>

          </div>

          <div
            style={{
              height: `${this.getBoxHeight ()}px`,
              padding: '0% 5%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              marginBottom: `${this.getMargin ().inBetween}px`,
            }}
          >
            <div>
              <Typography variant="h6" textAlign="center">
                False Positive Rate
              </Typography>
              <Typography variant="body2">
                Percentage of good edits that are falsely identified as damaing
                {' '}
              </Typography>
            </div>
          </div>

          <div
            style={{
              height: `${this.getBoxHeight ()}px`,
              padding: '0% 5%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div>
              <Typography variant="h6" textAlign="center">
                False Negative Rate
              </Typography>
              <Typography variant="body2">
                Percentage of damaing edits that won’t be identified {' '}
              </Typography>
            </div>

          </div>

        </div>
      </div>
    );
  }
}

export default ThresholdPerformance;

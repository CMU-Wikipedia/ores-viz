import React, {Component} from 'react';
import * as d3 from 'd3';
import data_balanced from '../data/data_balanced.csv';
import Slider from '@material-ui/core/Slider';

import 'rc-slider/assets/index.css';

class BarChart extends Component {
  constructor (props) {
    super (props);
    console.log ('called');
    console.log (this.props);
    this.chartRef = React.createRef ();
    this.getHeight = this.getHeight.bind (this);
    this.getWidth = this.getWidth.bind (this);
    this.drawChart = this.drawChart.bind (this);
    this.redrawChart = this.redrawChart.bind (this);
    this.state = {
      threshold: 50,
      width: 1000,
      height: 1000,
      graph1Scale: 0.6,
      dotWidth: 0,
      value: 50,
      sliderRange: [20, 1000],
    };
  }

  getWidth () {
    if (this.chartRef.current == null) {
      return this.state.width;
    } else {
      return this.chartRef.current.parentElement.offsetWidth;
    }
  }
  getHeight () {
    return this.state.width * 0.5;
  }

  onSliderChange = (event, threshold) => {
    this.setState ({
      threshold: threshold,
      value: threshold,
    });
    d3.select ('.rowChart svg').remove ();
    this.drawChart = this.drawChart.bind (this);
    this.drawChart ();
  };

  componentDidMount () {
    let width = this.getWidth ();
    let height = this.getHeight ();
    let sliderRight = width * 0.6;

    this.setState (
      {
        width: width,
        height: height,
        sliderRange: [20, sliderRight],
      },
      () => {
        this.drawChart (this);
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
    let sliderRight = width * 0.6;
    this.setState ({width: width, sliderRange: [20, sliderRight]});
    d3.select ('.rowChart svg').remove ();
    this.drawChart = this.drawChart.bind (this);
    this.drawChart ();
  }

  drawChart () {
    const margin = {top: 20, right: 0, bottom: 30, left: 20};
    let width = this.state.width - margin.left - margin.right;
    let height = this.state.height - margin.top - margin.bottom;
    // append the svg object to the body of the page
    let svg = d3
      .select ('.rowChart')
      .append ('svg')
      .attr ('width', width + margin.left + margin.right)
      .attr ('height', height + margin.top + margin.bottom);

    const threshold = this.state.threshold / 100;
    console.log ('threshold here');
    console.log (this.state.threshold);
    console.log (threshold);
    const graph1Scale = 0.6;

    const diameter = (width - margin.left - margin.right) * graph1Scale / 50;
    const dotWidth = diameter * 0.5;
    if (this.props.data != null) {
      const dd = dodge (threshold, this.props.data, diameter);

      const xAxis = g =>
        g
          .attr ('transform', `translate(0,${margin.top})`)
          .call (d3.axisTop (x).tickSizeOuter (0));

      const x = d3
        .scaleLinear ()
        .domain ([0, 1])
        .nice ()
        .range ([
          margin.left,
          (width - margin.right - margin.left) * graph1Scale + margin.left,
        ]);

      const shape = d3.scaleOrdinal (
        dd.map (d => d.category),
        d3.symbols.map (s =>
          d3.symbol ().size (diameter * diameter * 0.4).type (s) ()
        )
      );

      function dodge (threshold, data, diameter) {
        const circles = data
          .map (d => ({
            xvalue: parseFloat (d.confidence_damage).toFixed (2),
            x: 0.02 *
              Math.ceil (parseFloat (d.confidence_damage).toFixed (2) * 50),

            correct: parseFloat (d.confidence_damage).toFixed (2) >=
              threshold ==
              d.damaging_label,
            damaging_predict: parseFloat (d.confidence_damage).toFixed (2) >=
              threshold,
            damaging_label: d.damaging_label,
          }))
          .sort (function (a, b) {
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
          if (Math.abs (prev - b.x) < epsilon) {
            // belongs to the same col
            cnt += 1;
            b.y = diameter * cnt;
          } else {
            prev = b.x;
            cnt = 1;
            b.y = diameter;
          }

          if (b.correct) {
            b.category = 'circle';
          } else {
            b.category = 'cross';
          }

          if (b.damaging_predict) {
            b.color = d3.color ('#C57619');
          } else {
            b.color = d3.color ('#909090');
          }
        }

        return circles;
      }

      svg.append ('g').call (xAxis);

      svg
        .append ('line')
        .attr (
          'x1',
          (width - margin.right - margin.left) * graph1Scale +
            margin.left -
            dotWidth * 100 * (1 - threshold)
        )
        .attr ('y1', margin.top)
        .attr (
          'x2',
          (width - margin.right - margin.left) * graph1Scale +
            margin.left -
            dotWidth * 100 * (1 - threshold)
        )
        .attr ('y2', height - 30)
        .attr ('stroke-width', 2)
        .attr ('stroke', 'black')
        .style ('stroke-dasharray', '5,5');

      svg
        .append ('text')
        .attr (
          'x',
          (width - margin.right - margin.left) * graph1Scale +
            margin.left -
            dotWidth * 100 * (1 - threshold)
        )
        .attr ('y', height - 15)
        .attr ('text-anchor', 'middle')
        .text (threshold)
        .attr ('font-family', 'sans-serif')
        .attr ('font-size', '15px');

      svg
        .append ('g')
        .selectAll ('path')
        .data (dd)
        .join ('path')
        .attr (
          'transform',
          d => `translate(${x (d.x)},${d.y + margin.top}), rotate(45)`
        )
        .attr ('fill', function (d) {
          return d.color;
        })
        .attr ('d', d => shape (d.category));
    }
  }

  render () {
    return (
      <React.Fragment>
        <div
          style={{
            marginLeft: `${this.state.sliderRange[0]}px`,
            width: `${this.state.sliderRange[1] - this.state.sliderRange[0]}px`,
          }}
        >
          <div>{this.state.value}</div>
          <div>{this.state.threshold / 100}</div>

          <Slider
            defaultValue={50}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            onChangeCommitted={this.onSliderChange}
            step={1}
            marks
            min={1}
            max={100}
          />

        </div>
        <div className="rowChart" ref={this.chartRef} />
        <div style={{width: '200px'}} />

      </React.Fragment>
    );
  }
}

export default BarChart;

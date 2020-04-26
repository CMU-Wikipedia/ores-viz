import React, {Component} from 'react';
import * as d3 from 'd3';
import data_balanced from '../data/data_balanced.csv';
import Slider, {Range} from 'rc-slider';

import 'rc-slider/assets/index.css';

class BarChart extends Component {
  constructor (props) {
    super (props);
    this.myRef = React.createRef ();
    this.state = {data: null, threshold: 0.5, width: 0, height: 0};
    this.updateWindowDimensions = this.updateWindowDimensions.bind (this);
  }
  componentWillUnmount () {
    window.removeEventListener ('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions () {
    this.setState ({width: window.innerWidth, height: window.innerHeight});
  }

  componentDidMount () {
    this.updateWindowDimensions ();
    window.addEventListener ('resize', this.updateWindowDimensions);
    const app = this;
    d3
      .csv (data_balanced, function (d) {
        return {
          confidence_damage: +d.damagescore,
          damaging: parseFloat (d.damagescore).toFixed (2) >=
            app.state.threshold,
          damaging_label: d.damaging == 'True' ? true : false,
        };
      })
      .then (function (data) {
        app.setState ({data: data});
        app.drawChart (app);
      });
  }

  drawChart (app) {
    d3.select (svg).remove ();
    const threshold = app.state.threshold;
    const margin = {top: 20, right: 0, bottom: 30, left: 20};
    const graph1Scale = 0.6;
    const width = this.state.width * 0.8 * graph1Scale;
    const height = 500;

    const diameter = (width - margin.left - margin.right) * graph1Scale / 50;
    const dotWidth = diameter * 0.5;

    if (app.state.data != null) {
      console.log (this.state.width);
      const dd = dodge (app.state.data, diameter);
      console.log ('outputting dd');
      console.log (dd);

      const xAxis = g =>
        g
          .attr ('transform', `translate(0,${margin.top})`)
          .call (d3.axisTop (x).tickSizeOuter (0));

      const x = d3
        .scaleLinear ()
        .domain ([0, 1])
        .nice ()
        .range ([
          margin.left * graph1Scale,
          (width - margin.right) * graph1Scale,
        ]);

      const shape = d3.scaleOrdinal (
        dd.map (d => d.category),
        d3.symbols.map (s =>
          d3.symbol ().size (diameter * diameter * 0.4).type (s) ()
        )
      );

      function dodge (data, diameter) {
        const circles = data
          .map (d => ({
            xvalue: parseFloat (d.confidence_damage).toFixed (2),
            x: 0.02 *
              Math.ceil (parseFloat (d.confidence_damage).toFixed (2) * 50),

            correct: d.damaging == d.damaging_label,
            damaging_predict: d.damaging,
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

      this.svg.append ('g').call (xAxis);

      this.svg
        .append ('line')
        .attr (
          'x1',
          (width - margin.right) * graph1Scale -
            dotWidth * 100 * (1 - threshold)
        )
        .attr ('y1', margin.top)
        .attr (
          'x2',
          (width - margin.right) * graph1Scale -
            dotWidth * 100 * (1 - threshold)
        )
        .attr ('y2', height - 30)
        .attr ('stroke-width', 2)
        .attr ('stroke', 'black')
        .style ('stroke-dasharray', '5,5');

      this.svg
        .append ('text')
        .attr (
          'x',
          (width - margin.right) * graph1Scale -
            dotWidth * 100 * (1 - threshold)
        )
        .attr ('y', height - 15)
        .attr ('text-anchor', 'middle')
        .text (threshold)
        .attr ('font-family', 'sans-serif')
        .attr ('font-size', '15px');

      this.svg
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
        <div ref={this.myRef} style={{width: '200px'}}>
          <Slider />
        </div>
        <svg
          id="ha"
          width="80%"
          height="500"
          ref={element => (this.svg = d3.select (element))}
        />

      </React.Fragment>
    );
  }
}

export default BarChart;

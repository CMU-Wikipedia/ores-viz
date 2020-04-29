import React, {Component} from 'react';
import * as d3 from 'd3';
import dotData from '../../data/new.json';
import Typography from '@material-ui/core/Typography';

class GroupCompareVisualizer extends Component {
  constructor (props) {
    super (props);

    this.compareChartRef = React.createRef ();
    this.getWidth = this.getWidth.bind (this);
    // this.pack = this.pack (this);
    this.drawChart = this.drawChart.bind (this);
    this.redrawChart = this.redrawChart.bind (this);
    this.state = {
      threshold: 50,
      width: 1000,
      height: 1000,
      widthHeightRatio: 0.8,
      graph1Scale: 1,
      dotWidth: 0,
      sliderRange: [20, 1000],
    };
  }

  getWidth () {
    if (this.compareChartRef.current == null) {
      return this.state.width;
    } else {
      return this.compareChartRef.current.parentElement.offsetWidth;
    }
  }

  // pack = data =>
  //   d3.pack ().size ([width - 2, height - 3]).padding (3) (
  //     d3.hierarchy (data).sum (d => d.value).sort ((a, b) => b.value - a.value)
  //   );

  onSliderChange = (event, threshold) => {
    this.setState ({
      threshold: threshold,
    });
    d3.select ('.rowChart svg').remove ();
    // this.drawChart = this.drawChart.bind (this);
    // this.drawChart ();
  };

  componentDidMount () {
    let width = this.getWidth ();
    let height = width * 0.8;
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
        // this.redrawChart ();
      }, 200);
    });
  }

  redrawChart () {
    let width = this.getWidth ();
    let sliderRight = width - 30;
    this.setState ({
      width: width,
      height: width * 0.8,
      sliderRange: [10, sliderRight],
    });
    d3.select ('.rowChart svg').remove ();
    this.drawChart = this.drawChart.bind (this);
    this.drawChart ();
  }

  drawChart () {
    const margin = {top: 0, right: 30, bottom: 30, left: 10};
    let width = this.state.width - margin.left - margin.right;
    let height = this.state.height - margin.top - margin.bottom;
    // append the svg object to the body of the page
    let svg = d3
      .select ('.compareChart')
      .append ('svg')
      .attr ('width', width + margin.left + margin.right)
      .attr ('height', height + margin.top + margin.bottom);

    if (this.props.anonData != null && this.props.loggedData != null) {
    }
  }

  // shouldComponentUpdate (nextProps, nextState) {
  //   return (
  //     this.props.performance_data !== nextProps.performance_data ||
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
          <div className="compareChart" ref={this.compareChartRef} />
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

import React from 'react';
import logo from './logo.svg';
import BarChart from './components/d3example';
import './App.css';
import * as d3 from 'd3';
import Chart from './components/chart';

function App () {
  return (
    <div className="App">
      <div> this is a text message</div>
      <Chart />
      <p> after the barchart </p>

    </div>
  );
}

export default App;

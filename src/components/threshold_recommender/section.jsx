import React, { Component } from "react";
import * as d3 from "d3";
import axios from "axios";
import Recommender from "./recommender";

class RecommenderSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      damagingVersion: "",
    };
  }
}

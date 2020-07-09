import React, { Component } from "react";
import * as d3 from "d3";
import dotData from "../../data/new.json";
import ThresholdSlider from "../../partials/slider";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Circle, { Cross } from "../../partials/shape";
import TypeToggle from "../../partials/typeToggle";
import ThresholdInput from "../../partials/thresholdInput";
import diff from "../../partials/diff";

const getColor = (accuracy, defaultValue, currentValue) => {
  let perform = 1;
  if (accuracy) {
    if (defaultValue > currentValue) {
      perform = -1;
    } else if (defaultValue === currentValue) {
      perform = 0;
    } else {
      perform = 1;
    }
  } else {
    if (defaultValue > currentValue) {
      perform = 1;
    } else if (defaultValue === currentValue) {
      perform = 0;
    } else {
      perform = -1;
    }
  }
  //color for stroke
  if (perform === 1) {
    return d3.color("#159256");
  } else if (perform === 0) {
    return d3.color("#878787");
  } else {
    return d3.color("#921515");
  }
};

const getPerformance = (data) => {
  const TP = data[0],
    TN = data[1],
    FP = data[2],
    FN = data[3];
  //accuracy:
  const acc = (TP + TN) / (TP + TN + FP + FN);
  const fpr = FP / (FP + TN);
  const fnr = FN / (FN + TP);
  return [acc, fpr, fnr];
};

class GroupCompareVisualizer extends Component {
  constructor(props) {
    super(props);
    this.compareChartRef = React.createRef();
    this.comparePerformanceRef = React.createRef();
    this.wholePerformanceRef = React.createRef();
    this.getMargin = this.getMargin.bind(this);
    this.getWidth = this.getWidth.bind(this);
    this.drawChart = this.drawChart.bind(this);
    this.redrawChart = this.redrawChart.bind(this);
    this.getWholePerformance = this.getWholePerformance.bind(this);
    this.getPerformanceWidth = this.getPerformanceWidth.bind(this);
    this.getPerformanceForThreshold = this.getPerformanceForThreshold.bind(
      this
    );
    this.state = {
      threshold: 60,
      width: 1000,
      height: 1000,
      performanceWidth: 1000,
      group1Color: "#C57619",
      group2Color: "#3777A5",
      sliderRange: [20, 1000],
      wholePerformance: [0, 0, 0],
      defaultPerformance: [0, 0, 0],
      groupOnePerformance: null,
      groupTwoPerformance: null,
      damaging: true,
    };
  }

  getMargin() {
    const performanceHeight = this.state.performanceHeight;
    const bottom = 50;
    return {
      top: 0,
      right: 40,
      bottom: bottom,
      left: 20,
      blockHeight: (performanceHeight - bottom) / 3,
      chartHeight: (performanceHeight - bottom) / 12,
    };
  }

  getWidth() {
    if (this.compareChartRef.current === null) {
      return this.state.width;
    } else {
      return this.compareChartRef.current.parentElement.offsetWidth;
    }
  }

  getPerformanceWidth() {
    if (this.comparePerformanceRef.current === null) {
      return this.state.performanceWidth;
    } else {
      return this.comparePerformanceRef.current.parentElement.offsetWidth;
    }
  }

  getPerformanceHeight() {
    if (
      this.wholePerformanceRef.current === null ||
      this.compareChartRef.current === null
    ) {
      return this.state.performanceHeight;
    } else {
      return (
        (this.compareChartRef.current.parentElement.offsetWidth - 60) * 0.5 +
        300 -
        this.wholePerformanceRef.current.offsetHeight
      );
    }
  }

  getPerformanceForThreshold() {
    const threshold = this.state.threshold * 0.01;
    const damaging = this.state.damaging;
    if (this.props.groupOneData != null && this.props.groupTwoData != null) {
      const groupOneFP = this.props.groupOneData.filter(function (d) {
        return (
          (damaging ? d.confidence_damage : d.confidence_faith) >= threshold &&
          !(damaging ? d.damaging_label : d.faith_label)
        );
      }).length;

      const groupOneTP = this.props.groupOneData.filter(function (d) {
        return (
          (damaging ? d.confidence_damage : d.confidence_faith) >= threshold &&
          (damaging ? d.damaging_label : d.faith_label)
        );
      }).length;

      const groupOneFN = this.props.groupOneData.filter(function (d) {
        return (
          (damaging ? d.confidence_damage : d.confidence_faith) < threshold &&
          (damaging ? d.damaging_label : d.faith_label)
        );
      }).length;

      const groupOneTN = this.props.groupOneData.filter(function (d) {
        return (
          (damaging ? d.confidence_damage : d.confidence_faith) < threshold &&
          !(damaging ? d.damaging_label : d.faith_label)
        );
      }).length;

      const groupTwoFP = this.props.groupTwoData.filter(function (d) {
        return (
          (damaging ? d.confidence_damage : d.confidence_faith) >= threshold &&
          !(damaging ? d.damaging_label : d.faith_label)
        );
      }).length;

      const groupTwoTP = this.props.groupTwoData.filter(function (d) {
        return (
          (damaging ? d.confidence_damage : d.confidence_faith) >= threshold &&
          (damaging ? d.damaging_label : d.faith_label)
        );
      }).length;

      const groupTwoFN = this.props.groupTwoData.filter(function (d) {
        return (
          (damaging ? d.confidence_damage : d.confidence_faith) < threshold &&
          (damaging ? d.damaging_label : d.faith_label)
        );
      }).length;

      const groupTwoTN = this.props.groupTwoData.filter(function (d) {
        return (
          (damaging ? d.confidence_damage : d.confidence_faith) < threshold &&
          !(damaging ? d.damaging_label : d.faith_label)
        );
      }).length;

      return {
        groupOne: [groupOneTP, groupOneTN, groupOneFP, groupOneFN],
        groupTwo: [groupTwoTP, groupTwoTN, groupTwoFP, groupTwoFN],
        all: [
          groupOneTP + groupTwoTP,
          groupOneTN + groupTwoTN,
          groupOneFP + groupTwoFP,
          groupOneFN + groupTwoFN,
        ],
      };
    } else {
      return {
        groupOne: this.state.groupOnePerformance,
        groupTwo: this.state.groupTwoPerformance,
        all: this.state.wholePerformance,
      };
    }
  }

  onTypeChange = (event, type) => {
    if (type != null) {
      let acc = 0;
      let fpr = 0;
      let fnr = 0;

      if (this.props.performanceData != null) {
        const data = this.props.performanceData;
        acc =
          100 * (type ? data[50].damaging_accuracy : data[50].faith_accuracy);
        fpr = 100 * (type ? data[50].damaging_fpr : data[50].faith_fpr);
        fnr = 100 * (type ? data[50].damaging_fnr : data[50].faith_fnr);
      }

      this.setState({
        damaging: type,
        defaultPerformance: [acc.toFixed(1), fpr.toFixed(1), fnr.toFixed(1)],
      });

      this.state.damaging = type;
      this.state.defaultPerformance = [
        acc.toFixed(1),
        fpr.toFixed(1),
        fnr.toFixed(1),
      ];

      this.getWholePerformance();
      d3.select(".compareChart svg").remove();
      this.drawChart = this.drawChart.bind(this);
      this.drawChart();

      d3.select(".comparePerformance svg").remove();
      this.drawPerformanceChart = this.drawPerformanceChart.bind(this);
      this.drawPerformanceChart();
    }
  };

  onSliderChange = (event, threshold) => {
    this.setState({
      threshold: threshold,
    });

    this.getWholePerformance();

    d3.select(".compareChart svg").remove();
    this.drawChart = this.drawChart.bind(this);
    this.drawChart();
    d3.select(".comparePerformance svg").remove();
    this.drawPerformanceChart = this.drawPerformanceChart.bind(this);
    this.drawPerformanceChart();
  };

  onTextChange = (event) => {
    if (event.target.value != "") {
      this.onSliderChange(null, event.target.value);
    }
  };

  componentDidMount() {
    console.log("component mounted");
    let width = this.getWidth();
    let height = width / 2.4;
    let performanceWidth = this.getPerformanceWidth();
    let performanceHeight = this.getPerformanceHeight();
    let sliderRight = width - 40;
    // this.getWholePerformance();
    let acc = 0;
    let fpr = 0;
    let fnr = 0;
    if (this.props.performanceData != null) {
      const data = this.props.performanceData;
      acc = data[50].damaging_accuracy * 100;
      fpr = 100 * data[50].damaging_fpr;
      fnr = 100 * data[50].damaging_fnr;
    }

    this.setState(
      {
        width: width,
        height: height,
        sliderRange: [10, sliderRight],
        performanceWidth: performanceWidth,
        performanceHeight: performanceHeight,
        damaging: true,
        defaultPerformance: [acc.toFixed(1), fpr.toFixed(1), fnr.toFixed(1)],
      },
      () => {
        this.getWholePerformance();
        this.drawChart();
        this.drawPerformanceChart();
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
    let performanceWidth = this.getPerformanceWidth();
    let performanceHeight = this.getPerformanceHeight();
    let sliderRight = width - 40;
    this.setState({
      width: width,
      height: width / 2,
      performanceWidth: performanceWidth,
      performanceHeight: performanceHeight,

      sliderRange: [10, sliderRight],
    });
    d3.select(".compareChart svg").remove();
    this.drawChart = this.drawChart.bind(this);
    this.drawChart();
    d3.select(".comparePerformance svg").remove();
    this.drawPerformanceChart = this.drawPerformanceChart.bind(this);
    this.drawPerformanceChart();
  }

  getWholePerformance() {
    if (
      this.props.performanceData != null &&
      this.props.groupOneData != null &&
      this.props.groupTwoData != null
    ) {
      const performance = this.getPerformanceForThreshold();
      const groupOnePerf = performance.groupOne;
      const groupTwoPerf = performance.groupTwo;
      const allPerf = getPerformance(performance.all);

      this.state.wholePerformance = allPerf;
      this.state.groupOnePerformance = groupOnePerf;
      this.state.groupTwoPerformance = groupTwoPerf;

      this.setState({
        wholePerformance: allPerf,
        groupOnePerformance: groupOnePerf,
        groupTwoPerformance: groupTwoPerf,
      });
    }
  }

  drawPerformanceChart() {
    const margin = this.getMargin();
    let width = this.state.performanceWidth - margin.left - margin.right;
    let height = this.state.performanceHeight - margin.top - margin.bottom;
    let svg = d3
      .select(".comparePerformance")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    let blockHeight = height / 3;
    let vizHeight = blockHeight / 4;
    // TP, TN, FP, FN
    if (
      this.state.groupOnePerformance != null &&
      this.state.groupTwoPerformance != null
    ) {
      let groupOnePerformance = getPerformance(this.state.groupOnePerformance);
      let groupTwoPerformance = getPerformance(this.state.groupTwoPerformance);

      let wholePerformance = this.state.wholePerformance;
      const x = d3
        .scaleLinear()
        .domain([0, 1])
        .nice()
        .range([margin.left, margin.left + width]);

      function drawPerformance(
        height,
        defaultPerformance,
        currentPerformance,
        color,
        larger,
        groupNumber,
        largerPerformance
      ) {
        const markHeight = 5;
        const markWidth = 6;
        const actualx = x(currentPerformance);

        svg
          .append("line")
          .attr("x1", margin.left)
          .attr("y1", height)
          .attr("x2", margin.left + width)
          .attr("y2", height)
          .attr("stroke-width", 2)
          .attr("stroke", "grey");
        svg
          .append("line")
          .attr("x1", actualx)
          .attr("y1", height - markHeight)
          .attr("x2", actualx)
          .attr("y2", height + markHeight)
          .attr("stroke-width", markWidth)
          .attr("stroke", color);

        svg
          .append("line")
          .attr("x1", x(defaultPerformance))
          .attr("y1", height)
          .attr("x2", actualx)
          .attr("y2", height)
          .attr("stroke-width", 3)
          .attr("stroke", color);

        let tooltipHalfWidth = 40;
        let tooltipx = actualx - tooltipHalfWidth;

        if (tooltipx < margin.left) {
          tooltipx = margin.left;
        } else if (tooltipx > width + margin.left + margin.right) {
          tooltipx = width + margin.left + margin.right - tooltipHalfWidth;
        }
        let tooltipy = height + 10;
        if (larger) {
          if (groupNumber == 1) {
            tooltipy = height - 35;
          }

          svg
            .append("rect")
            .attr("x", tooltipx)
            .attr("y", tooltipy)
            .attr("width", tooltipHalfWidth * 2)
            .attr("height", 24)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("fill", color);

          svg
            .append("text")
            .attr("x", tooltipx + tooltipHalfWidth)
            .attr("y", tooltipy + 13)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text(largerPerformance + " more")
            .attr("font-family", "sans-serif")
            .attr("fill", "white")
            .attr("font-size", "14px");
        }
      }

      ["Accuracy", "FPR", "FNR"].forEach((item, index) => {
        const groupOneHeight = blockHeight * index + vizHeight * 3;
        const groupTwoHeight = margin.top + blockHeight * index + vizHeight * 4;

        const groupOneCurrentPerformance = groupOnePerformance[index];
        const groupTwoCurrentPerformance = groupTwoPerformance[index];

        let min = groupOneCurrentPerformance;
        let max = groupTwoCurrentPerformance;
        let larger = 2;
        if (groupOneCurrentPerformance > groupTwoCurrentPerformance) {
          min = groupTwoCurrentPerformance;
          max = groupOneCurrentPerformance;
          larger = 1;
        } else if (groupOneCurrentPerformance > groupTwoCurrentPerformance) {
          larger = 0;
        }

        let largerPercentage = 0;
        if (min === 0) {
          largerPercentage = "∞";
        } else {
          largerPercentage = Math.round(((max - min) * 100) / max) + "%";
        }

        drawPerformance(
          groupOneHeight,
          wholePerformance[index],
          groupOnePerformance[index],
          d3.color(this.state.group1Color),
          larger === 1,
          1,
          largerPercentage
        );
        drawPerformance(
          groupTwoHeight,
          wholePerformance[index],
          groupTwoPerformance[index],
          d3.color(this.state.group2Color),
          larger === 2,
          2,
          largerPercentage
        );
      });
    }
  }

  drawChart() {
    const margin = { top: 20, right: 40, bottom: 0, left: 0 };
    let width = this.state.width - margin.left - margin.right;
    let height = width / 2.5;
    // append the svg object to the body of the page
    let svg = d3
      .select(".compareChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

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

    const groupSize = width / 2.4;

    const pack = (data) =>
      d3
        .pack()
        .size([groupSize - 2, groupSize - 2])
        .padding(3)(
        d3
          .hierarchy(data)
          .sum((d) => d.value)
          .sort((a, b) => b.value - a.value)
      );

    const threshold = this.state.threshold * 0.01;
    const app = this;

    if (
      this.props.groupOneData != null &&
      this.props.groupTwoData != null &&
      this.state.groupOnePerformance != null &&
      this.state.groupTwoPerformance != null
    ) {
      const groupOnePerf = this.state.groupOnePerformance;
      const groupTwoPerf = this.state.groupTwoPerformance;
      const groupOneTP = groupOnePerf[0],
        groupOneTN = groupOnePerf[1],
        groupOneFP = groupOnePerf[2],
        groupOneFN = groupOnePerf[3];
      const groupTwoTP = groupTwoPerf[0],
        groupTwoTN = groupTwoPerf[1],
        groupTwoFP = groupTwoPerf[2],
        groupTwoFN = groupTwoPerf[3];

      const dots = pack(dotData)
        .children.slice(0, this.props.sliceNumber)
        .map((d) => ({
          x: d.x,
          y: d.y,
          r: d.r,
          category: "cross",
        }))
        .sort(function (a, b) {
          const centerX = height;
          const centerY = height / 2 + margin.top;
          const distA = Math.sqrt(
            Math.pow(a.x - centerX, 2) + Math.pow(a.y - centerY, 2)
          );
          const distB = Math.sqrt(
            Math.pow(b.x - centerX, 2) + Math.pow(b.y - centerY, 2)
          );
          return distA - distB;
        });

      const dotRadius = dots[0].r;

      const sortArr = (x, y) => {
        const getStatus = (d) => {
          const correct =
            parseFloat(
              this.state.damaging ? d.confidence_damage : d.confidence_faith
            ).toFixed(2) >=
              threshold ==
            this.state.damaging
              ? d.damaging_label
              : d.faith_label;
          const predict =
            parseFloat(
              this.state.damaging ? d.confidence_damage : d.confidence_faith
            ).toFixed(2) >= threshold;

          if (predict && !correct) return 1;
          if (predict && correct) return 2;
          if (!predict && !correct) return 3;
          if (!predict && correct) return 4;
        };

        let xStat = getStatus(x),
          yStat = getStatus(y);
        if (xStat < yStat) return -1;
        if (xStat > yStat) return 1;
        else return 0;
      };

      function getSymbolColor(data, color, fp, tp, fn, tn, damaging) {
        let dd = [];
        const cp = [fp, fp + tp, fp + tp + fn];
        console.log(cp);

        dots.forEach(function (dot, index) {
          const correct =
            parseFloat(
              damaging
                ? data[index].confidence_damage
                : data[index].confidence_faith
            ).toFixed(2) >=
              threshold ==
            damaging
              ? data[index].damaging_label
              : data[index].faith_label;
          const predict =
            parseFloat(
              damaging
                ? data[index].confidence_damage
                : data[index].confidence_faith
            ).toFixed(2) >= threshold;

          let col = predict ? color : d3.color("#909090");
          let cat = correct ? 1 : 0;

          dd.push({
            x: dot.x,
            y: dot.y,
            category: cat,
            color: col,
            rev_id: +data[index].rev_id,
            correct:
              parseFloat(
                damaging
                  ? data[index].confidence_damage
                  : data[index].confidence_faith
              ).toFixed(2) >=
                threshold ==
              damaging
                ? data[index].damaging_label
                : data[index].faith_label,
            predict:
              parseFloat(
                damaging
                  ? data[index].confidence_damage
                  : data[index].confidence_faith
              ).toFixed(2) >= threshold,
          });
        });

        return dd;
      }

      this.props.groupOneData.sort(sortArr);
      let groupOneDots = getSymbolColor(
        this.props.groupOneData,
        d3.color(this.state.group1Color),
        groupOneFP,
        groupOneTP,
        groupOneFN,
        groupOneTN,
        this.state.damaging
      );
      this.props.groupTwoData.sort(sortArr);
      let groupTwoDots = getSymbolColor(
        this.props.groupTwoData,
        d3.color(this.state.group2Color),
        groupTwoFP,
        groupTwoTP,
        groupTwoFN,
        groupTwoTN,
        this.state.damaging
      );

      const parentWidth = this.getWidth();
      const x = (x, offset) => {
        console.log(x + margin.left + 270);
        return x + margin.left + 270 + width * offset;
      };

      svg
        .append("g")
        .selectAll("path")
        .data(groupOneDots)
        .join("path")
        .attr(
          "transform",
          (d) =>
            `translate(${margin.left + width * 0.05 + d.x},${d.y}),rotate(45)`
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
            .size(dotRadius * dotRadius * 1.5)
        )
        .style("cursor", "pointer")
        .on("click", (d) =>
          diff(
            d,
            this.state.damaging,
            function (d) {
              return x(d, 0.07);
            },
            { top: 480 },
            height,
            ".compareChart"
          )
        )
        .on("mouseover", function (d) {
          d3.select(".compareChart div").remove();
        });

      svg
        .append("g")
        .selectAll("path")
        .data(groupTwoDots)
        .join("path")
        .attr(
          "transform",
          (d) =>
            `translate(${margin.left + width * 0.55 + d.x},${d.y}),rotate(45)`
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
            .size(dotRadius * dotRadius * 1.5)
        )
        .style("cursor", "pointer")
        .on("click", (d) =>
          diff(
            d,
            this.state.damaging,
            function (d) {
              return x(d, 0.57);
            },
            { top: 480 },
            height,
            ".compareChart"
          )
        )
        .on("mouseover", function (d) {
          d3.select(".compareChart div").remove();
        });
    }
  }

  getClickTip() {
    return (
      <span>
        <strong>TIP:</strong> Click on a revision (cross or circle) to view more
        details.
      </span>
    );
  }

  render() {
    const message = this.state.damaging ? "damaging" : "good faith";
    const opposite = this.state.damaging ? "good" : "bad faith";
    return (
      <React.Fragment>
        <div
          ref={this.visualizationRef}
          style={{
            width: "55%",
            display: "inline-block",
            verticalAlign: "top",
          }}
        >
          <div className="upperSettings">
            <Grid container spacing={0}>
              <TypeToggle
                damaging={this.state.damaging}
                onChange={this.onTypeChange}
                gridSize={9}
                key={this.state.damaging}
              />
              <Grid item xs={3} className="threshold">
                <div className="innerBox">
                  <Typography variant="subtitle2">
                    <Box>threshold</Box>
                  </Typography>

                  <Grid container spacing={2} className="options">
                    <Grid item xs={12} style={{ paddingTop: 0 }}>
                      {/* <Typography component="div" variant="h6" className="text">
                        {this.state.threshold} %
                      </Typography> */}
                      <ThresholdInput
                        value={this.state.threshold}
                        multiplier={1}
                        onChange={this.onTextChange}
                      />
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
            <Typography variant="subtitle2">Fairness in Groups</Typography>
            <ThresholdSlider
              value={this.state.threshold}
              defaultValue={60}
              middleText={this.getClickTip}
              onChangeCommitted={this.onSliderChange}
            />
          </div>
          <div className="compareChart" ref={this.compareChartRef} />
          <div
            style={{
              marginLeft: `${this.state.sliderRange[0]}px`,
              width: `${
                this.state.sliderRange[1] - this.state.sliderRange[0]
              }px`,
              transform: "translate(0px,-20px)",
            }}
          >
            <div
              style={{
                width: "50%",
                display: "inline-block",
              }}
            >
              <Typography
                variant="h6"
                component="div"
                style={{
                  textAlign: "center",
                  color: `${this.state.group1Color}`,
                }}
              >
                Newcomer Edits
              </Typography>
              <Typography
                variant="body2"
                component="div"
                style={{ textAlign: "center" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <Box width="80%">
                    Model performance on edits made by newcomer editors
                  </Box>
                </div>
              </Typography>
            </div>
            <div
              style={{
                width: "50%",
                display: "inline-block",
                // transform: 'translate(0,-10px)',
              }}
            >
              <Typography
                variant="h6"
                component="div"
                style={{
                  textAlign: "center",
                  color: `${this.state.group2Color}`,
                }}
              >
                Experienced Edits
              </Typography>

              <Typography
                variant="body2"
                component="div"
                style={{ textAlign: "center" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <Box width="80%">
                    Model performance on edits made by experienced editors
                  </Box>
                </div>
              </Typography>
            </div>
            <div className="legendCard">
              <Typography component="div" variant="subtitle2">
                legend
              </Typography>
              <Grid container spacing={0} style={{ marginTop: "10px" }}>
                <Grid item xs={6}>
                  <div className="legendMark">
                    <Circle size={12} color="#909090" />{" "}
                    <Typography component="span" variant="body2">
                      Correctly classified {opposite} edits
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div className="legendMark">
                    <Circle size={12} color={this.state.group1Color} />
                    <span style={{ width: "2px" }} />
                    <Circle size={12} color={this.state.group2Color} />{" "}
                    <Typography component="span" variant="body2">
                      Correctly classified {message} edits
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div className="legendMark">
                    <Cross size={12} color="#909090" />{" "}
                    <Typography component="span" variant="body2">
                      Uncaught {message} edits{" "}
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div className="legendMark">
                    <Cross size={12} color={this.state.group1Color} />
                    <span style={{ width: "2px" }} />
                    <Cross size={12} color={this.state.group2Color} />{" "}
                    <Typography component="span" variant="body2">
                      Misclassified {opposite} edits{" "}
                    </Typography>
                  </div>
                </Grid>
              </Grid>
            </div>
          </div>
        </div>

        <div className="sidePanel" id="comparePerformanceSidePanel">
          <div
            className="overallPerformance"
            ref={this.wholePerformanceRef}
            style={{ borderBottom: "1px solid lightgrey" }}
          >
            <Typography component="div" variant="subtitle2">
              PERFORMANCE
            </Typography>
            <Grid
              container
              className="performanceBlock"
              spacing={0}
              style={{ marginTop: "5px", textAlign: "left", marginLeft: "0px" }}
            >
              <Grid item xs={4}>
                <Typography component="div" className="title">
                  ACC
                </Typography>
                <Typography component="div">
                  <Box className="data">
                    {(this.state.wholePerformance[0] * 100).toFixed(1)}%
                  </Box>
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography component="div" className="title">
                  FPR
                </Typography>
                <Typography component="div">
                  <Box className="data">
                    {(this.state.wholePerformance[1] * 100).toFixed(1)}%
                  </Box>
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography component="div" className="title">
                  FNR
                </Typography>
                <Typography component="div">
                  <Box className="data">
                    {(this.state.wholePerformance[2] * 100).toFixed(1)}%
                  </Box>
                </Typography>
              </Grid>
            </Grid>
          </div>
          <div style={{ display: "flex" }}>
            <div
              style={{
                width: "40%",
                display: "inline-block",
              }}
              className="groupPerformance"
            >
              {["Accuracy", "FPR", "FNR"].map((value, index) => {
                return (
                  <div
                    style={{
                      height: `${this.getMargin().blockHeight}px`,
                      fontSize: "12px",
                      transform: `translate(0px,7px)`,
                    }}
                  >
                    <div
                      style={{
                        height: `${this.getMargin().chartHeight}px`,
                      }}
                    />
                    <div
                      style={{
                        height: `${this.getMargin().chartHeight}px`,
                        display: "flex",
                        flexDirection: "column-reverse",
                      }}
                    >
                      <Typography variant="body2" className="classTitle">
                        {value}
                      </Typography>
                    </div>

                    <div
                      style={{
                        height: `${this.getMargin().chartHeight}px`,
                        display: "flex",
                        flexDirection: "column-reverse",
                      }}
                    >
                      <div>
                        <div className="title">newcomer edits</div>
                        <div
                          className="data"
                          style={{ color: this.state.group1Color }}
                        >
                          {this.state.groupOnePerformance === null
                            ? "..."
                            : (
                                getPerformance(this.state.groupOnePerformance)[
                                  index
                                ] * 100
                              ).toFixed(1) + "%"}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        height: `${this.getMargin().chartHeight}px`,
                        display: "flex",
                        flexDirection: "column-reverse",
                      }}
                    >
                      <div>
                        <div className="title">experienced edits</div>
                        <div
                          className="data"
                          style={{ color: this.state.group2Color }}
                        >
                          {this.state.groupTwoPerformance === null
                            ? "..."
                            : (
                                getPerformance(this.state.groupTwoPerformance)[
                                  index
                                ] * 100
                              ).toFixed(1) + "%"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ width: "60%", display: "inline-block" }}>
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

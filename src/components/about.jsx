import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import "../App.scss";
import Circle, { Cross } from "../../src/partials/shape";

class About extends Component {
  getMainContent(obj) {
    return (
      <div>
        <Typography variant="subtitle1" style={{ textAlign: "left" }}>
          {obj.title}
        </Typography>
        <div
          style={{
            marginTop: "10px",
            marginBottom: 25,
          }}
        >
          <Typography variant="body2" style={{ color: "grey" }}>
            {obj.desc}{" "}
          </Typography>
        </div>
      </div>
    );
  }

  getPredTableItem(title, desc, icon) {
    return (
      <td class="predTableElem">
        {icon}
        <div>
          <div class="boldText">{title}</div>
          <p style={{ color: "grey" }}>{desc}</p>
        </div>
      </td>
    );
  }

  render() {
    return (
      <div className="aboutPage">
        <div className="aboutSection" style={{ width: "50%" }}>
          {this.getMainContent({
            title: "About ORES",
            desc:
              "ORES is a web service that provides machine learning services for Wikimedia projects. The system is designed to help human editors perform critical wiki-work and to increase their productivity by automating tasks like detecting vandalism and removing edits made in bad faith.",
          })}
          <a
            href="https://ores.wikimedia.org/ui/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Try ORES API
          </a>
        </div>
        <div className="container">
          <div style={{ width: "50%", borderRight: "1px solid lightgrey" }}>
            <div className="aboutSection">
              {this.getMainContent({
                title: "How ORES Works",
                desc:
                  "ORES scores individual edits that are made to articles on Wikipedia. On the scale of 0 to 1, ORES scores describe the quality of edits and help humans determine which kinds of edits are damaging to articles and which kinds of edits are made in good faith.",
              })}
              <table className="oresTable" colspan={5}>
                <tr>
                  <td className="boldText">Input</td>
                  <td></td>
                  <td className="boldText">Model</td>
                  <td></td>
                  <td className="boldText">Output</td>
                </tr>
                <tr>
                  <td>
                    <div className="aboutButton">Edit: #124230</div>
                  </td>
                  <td>
                    <img
                      className="arrow"
                      src="about/arrow.png"
                      alt="is evaluated by"
                    />
                  </td>
                  <td>
                    <div className="oresText">ORES</div>
                  </td>
                  <td>
                    <img
                      className="arrow"
                      src="about/arrow.png"
                      alt="which gives scores: "
                    />
                  </td>
                  <td className="DGgrid">
                    <div>
                      <div style={{ color: "grey", width: 75 }}>Damaging:</div>
                      <div class="highlight bad">0.87142</div>
                    </div>
                    <div>
                      <div style={{ color: "grey", width: 75 }}>
                        Goodfaith:{" "}
                      </div>
                      <div class="highlight good">0.92245</div>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            <div
              className="aboutSection"
              style={{ borderTop: "1px solid lightgrey" }}
            >
              {this.getMainContent({
                title: "How the Threshold Works",
                desc:
                  "Setting the threshold can change the way the model predicts. With different thresholds, the same score can have different prediction results",
              })}
              <div class="thresList">
                <div>
                  <div class="boldText">Damaging Score:</div>
                  <div class="highlight">0.87142</div>
                </div>
              </div>
              <div class="thresList">
                <div>
                  <div>1. Threshold = 0.5</div>
                  <div class="highlight bad">Damaging</div>
                </div>
                <div>
                  <div>2. Threshold = 0.9</div>
                  <div class="highlight good">Non-damaging</div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="aboutSection"
            style={{ width: "50%", paddingLeft: 30 }}
          >
            {this.getMainContent({
              title: "Types of Predictions",
              desc:
                "Depending on what ORES predicts and whether the prediction is correct, there are four types of possible results: True Positives, False Positives, True Negatives, and False Negatives.",
            })}
            <table
              cellSpacing={0}
              cellPadding={0}
              style={{ margin: "auto", width: "90%" }}
            >
              <tr style={{ spacing: 0 }}>
                {this.getPredTableItem(
                  "True Positive",
                  "Actual damaging edits predicted as damaging",
                  <Circle color="#C57619" size={12} />
                )}
                {this.getPredTableItem(
                  "False Positive",
                  "Actual good edits predicted as damaging",
                  <Cross color="#C57619" size={12} />
                )}
              </tr>
              <tr>
                {this.getPredTableItem(
                  "True Negative",
                  "Actual good edits predicted as non-damaging",
                  <Circle color="#909090" size={12} />
                )}
                {this.getPredTableItem(
                  "False Negative",
                  "Actual damaging edits predicted as non-damaging",
                  <Cross color="#909090" size={12} />
                )}
              </tr>
            </table>
            <table class="predLegend" cellSpacing={0} cellPadding={0}>
              <tr>
                <td>
                  <Circle size={12} color="#C57619" />
                  <Cross size={12} color="#C57619" />
                  <div class="text">Damaging Prediction</div>
                </td>
                <td>
                  <Circle size={12} color="#C57619" />
                  <Circle size={12} color="#909090" />
                  <div class="text">Correct Prediction</div>
                </td>
              </tr>
              <tr>
                <td>
                  <Circle size={12} color="#909090" />
                  <Cross size={12} color="#909090" />
                  <div class="text">Non-Damaging Prediction</div>
                </td>
                <td>
                  <Cross size={12} color="#C57619" />
                  <Cross size={12} color="#909090" />
                  <div class="text">Incorrect Prediction</div>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default About;

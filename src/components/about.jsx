import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import { Section, SectionHeader } from "./content";

class About extends Component {
  render() {
    return (
      <React.Fragment>
        {[
          {
            title: "About ORES",
            desc:
              "ORES is a web service that provides machine learning services for Wikimedia projects. The system is designed to help human editors perform critical wiki-work and to increase their productivity by automating tasks like detecting vandalism and removing edits made in bad faith.",
            below: "test",
          },
          {
            title: "How ORES Works",
            desc:
              "ORES scores individual edits taht are made to articles on Wikipedia. On the scale of 0 to 1, ORES scores describe the quality of edits and help humans determine which kinds of edits are damaging to articles and which kinds of edits are made in good faith.",
            below: "test",
          },
          {
            title: "How the Threshold Works",
            desc:
              "Setting the threshold can change the way the model predicts. With different thresholds, the same score can have different prediction results",
            below: "test",
          },
          {
            title: "Types of Predictions",
            desc:
              "Depending on what ORES predicts and whether the prediction is correct, there are four types of possible results: True Positives, False Positives, True Negatives, and False Negatives.",
            below: "test",
          },
        ].map((obj) => {
          return (
            <Section>
              <SectionHeader>
                <Typography variant="subtitle1" style={{ textAlign: "left" }}>
                  {obj.title}
                </Typography>
                <div
                  style={{
                    width: "50%",
                    marginTop: "10px",
                  }}
                >
                  <Typography variant="body2" style={{ color: "grey" }}>
                    {obj.desc}{" "}
                  </Typography>
                </div>
              </SectionHeader>
            </Section>
          );
        })}
      </React.Fragment>
    );
  }
}

export default About;

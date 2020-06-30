import React, { Component } from "react";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import ListItem from "@material-ui/core/ListItem";
import Box from "@material-ui/core/Box";
import { Link } from "react-router-dom";
import "../App.scss";

class DrawerList extends Component {
  constructor(props) {
    super(props);
    this.state = { selected: -1 };
    this.clickSection = this.clickSection.bind(this);
  }

  clickSection(index) {
    this.setState({ selected: index });
    console.log("ha");
    console.log(index);
  }

  render() {
    return (
      <List style={{ marginTop: "10vh" }}>
        {[
          //   { text: "About ORES", path: "/about-ores" },
          { text: "Threshold Explorer", path: "/explorer/" },
          { text: "Disparity Visualizer", path: "/disparity/" },
          { text: "Threshold Recommender", path: "/recommender/" },
          //   { text: "Feature Injection", path: "/injection" },
        ].map((obj, index) => (
          <Link to={obj.path}>
            <ListItem
              className={this.props.klass}
              button
              key={obj.text}
              onClick={() => this.clickSection(index)}
            >
              <div style={{ width: "12.5%" }} />
              <div style={{ width: "87.5%" }}>
                <Typography component="div">
                  <Box
                    className={
                      this.state.selected === index
                        ? "active-section"
                        : "inactive-section"
                    }
                  >
                    {obj.text}
                  </Box>
                </Typography>
              </div>
            </ListItem>
          </Link>
        ))}
      </List>
    );
  }
}

export default DrawerList;

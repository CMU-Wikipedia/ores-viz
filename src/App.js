import React from "react";
import logo from "./logo.svg";
import "./App.scss";
import * as d3 from "d3";
import Box from "@material-ui/core/Box";
import Chart from "./components/threshold_explorer/threshold_explorer_section";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import ListItem from "@material-ui/core/ListItem";

import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import styled from "styled-components";
import MainContent from "./components/content";
import DrawerList from "./partials/drawerList";

import { BrowserRouter, Link } from "react-router-dom";

const SectionHeader = styled.div`
  padding-left: 10px;
  padding-top: 5px;
  padding-bottom: 30px;
  border-bottom: 1px solid lightgrey;
`;

// const PerformanceTitle = styled.h1`
//   font-size: 1.1em;
//   text-align: left;
//   margin-bottom: 0px;
//   font-weight: 800;
// `;

const Section = styled.div`
  display: block;
  margin-bottom: 15vh;
`;

const drawerWidth = 270;

let theme = createMuiTheme({
  typography: {
    root: {
      component: "div",
    },
    fontFamily: "Noto Sans KR",
    subtitle1: {
      fontFamily: "Noto Serif",
      fontSize: "24px",
    },
    subtitle2: {
      fontSize: "12px",
      marginTop: "10px",
      color: "#B0B0B0",
      fontWeight: "bold",
      textTransform: "uppercase",
      textAlign: "left",
    },
    h6: {
      fontWeight: "bold",
      fontSize: "16px",
      textAlign: "left",
    },
    body1: {
      // textAlign: 'left',
      fontSize: "14px",
    },
    body2: {
      textAlign: "left",
      fontSize: "14px",
    },
    button: {
      fontStyle: "italic",
    },
    h5: {
      fontSize: "15px",
      color: "blue",
      fontWeight: "bold",
      textTransform: "none",
      textAlign: "left",
    },
  },
});

theme = responsiveFontSizes(theme);

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    // fontFamily: 'Noto Sans, sans-serif',
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    textAlign: "center",
    position: "relative",
  },
  drawerPaper: {
    width: drawerWidth,
    paddingTop: "35px",
    paddingBottom: "35px",
  },
  paper: {
    textAlign: "left",
    padding: "20px 20px",
  },
  list: {
    fontSize: "16px",
    textDecoration: "none",
  },
  // necessary for content to be below app bar
  toolbar: {
    padding: theme.spacing(2),
  },
  content: {
    width: `calc(100% - ${drawerWidth}px)`,
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: "1.5vh",
    height: "100vh",
  },
}));

function App() {
  const classes = useStyles();
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <ThemeProvider theme={theme}>
        <div className="App">
          <body>
            <div className={classes.root}>
              <Drawer
                className={classes.drawer}
                variant="permanent"
                classes={{ paper: classes.drawerPaper }}
                anchor="left"
              >
                <Link to="/">
                  <Paper className={classes.paper} elevation="0">
                    <div style={{ textAlign: "center" }}>
                      <Typography variant="subtitle1">WIKIPEDIA</Typography>
                      <Typography style={{ textAlign: "center" }}>
                        ORES Explorer
                      </Typography>
                    </div>
                  </Paper>
                </Link>
                <DrawerList klass={classes.list} />
                <List
                  style={{
                    position: "absolute",
                    bottom: "120px",
                    width: "100%",
                  }}
                >
                  {[
                    { text: "About ORES Explorer", path: "/about-us" },
                    { text: "External Resources", path: "/external" },
                  ].map((obj, index) => (
                    <Link to={obj.path}>
                      <ListItem className={classes.list} button key={obj.text}>
                        <div style={{ width: "12.5%" }} />
                        <div style={{ width: "87.5%" }}>
                          <Typography component="div">
                            <Box color="#989898">{obj.text}</Box>
                          </Typography>
                        </div>
                      </ListItem>
                    </Link>
                  ))}
                </List>
              </Drawer>
              <main className={classes.content}>
                <MainContent />
              </main>
            </div>
          </body>
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

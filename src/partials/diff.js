import * as d3 from "d3";
import axios from "axios";
import ReactDOMServer from "react-dom/server";
import React from "react";
import Circle, { Cross } from "./shape";

async function getDiff(id) {
  var cors = "https://cors-anywhere.herokuapp.com/";
  var api = "https://en.wikipedia.org/w/api.php";
  var articleInfo = "";
  var diffInfo = "";

  function ValidateIPaddress(ipaddress) {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      ipaddress
    );
  }

  await axios
    .get(
      cors + api + "?format=json&action=query&revids=" + id + "&prop=revisions"
    )
    .then(
      (res) => {
        const page = res.data.query.pages[Object.keys(res.data.query.pages)[0]];
        const rev = page.revisions[0];
        const time = new Date(rev.timestamp);

        articleInfo =
          "<strong>Article Title: </strong>" +
          page.title +
          "<h5>Edited by " +
          (ValidateIPaddress(rev.user) ? "Anonymous" : rev.user) +
          " at " +
          time.toLocaleTimeString() +
          " on " +
          time.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }) +
          "</h5>\n";

        if (rev.comment !== "") {
          articleInfo =
            articleInfo +
            "<strong>Comment from editor: </strong><p>" +
            rev.comment +
            "</p>";
        }
      },
      (err) => {}
    );

  await axios
    .get(
      cors +
        api +
        "?&action=compare&torelative=prev&prop=diff&fromrev=" +
        id +
        "&format=json"
    )
    .then(
      (res) => {
        diffInfo =
          "<table>" +
          "<tr class='header'><td class='before' colspan='2'>Before</td><td class='after' colspan='2'>After</td></tr>" +
          res.data.compare["*"] +
          "</table>";
      },
      (err) => {}
    );

  if (articleInfo !== "" || diffInfo !== "")
    return "<div class='apirow'>" + articleInfo + diffInfo + "</div>";

  return "";
}

export function loadDiff(
  d,
  damaging,
  x,
  margin,
  height,
  parent,
  type = 0,
  group = 0
) {
  var div = d3.select(parent).append("div").attr("class", "tooltip");

  if (type === 1) {
    const message = damaging ? "damaging" : "good faith";
    const opposite = damaging ? "good" : "bad faith";
    const boolean = d.correct ? "True" : "False";
    const predType = boolean + (d.predict ? " Positive" : " Negative");
    const col = group === 1 ? "#3777a5" : "#C57619";
    const grey = "#909090";

    let description = "This was a";
    if (predType === "True Negative")
      description =
        description + " correctly classified " + opposite + " edit.";
    if (predType === "False Negative")
      description = description + "n uncaught " + message + " edit";
    if (predType === "True Positive")
      description = description + " correctly classified " + message + " edit.";
    if (predType === "False Positive")
      description = description + " mis-classified " + opposite + " edit.";

    var icon = "";
    if (predType === "True Negative")
      icon = ReactDOMServer.renderToString(<Circle size={10} color={grey} />);
    if (predType === "False Negative")
      icon = ReactDOMServer.renderToString(<Cross size={10} color={grey} />);
    if (predType === "True Positive")
      icon = ReactDOMServer.renderToString(<Circle size={10} color={col} />);
    if (predType === "False Positive")
      icon = ReactDOMServer.renderToString(<Cross size={10} color={col} />);

    div
      .attr("class", "tooltip small")
      .style("width", "200px")
      .html(
        "<div class='main'><div style='margin-top:0px; display:inline;'>" +
          icon +
          "<strong>" +
          predType +
          "</strong></div><div>" +
          description +
          '</div><em style="font-weight:600; margin-bottom:0px;">Click for more details about the edit.</em></div>'
      )
      .on("click", () => loadDiff(d, damaging, x, margin, height, parent, 0));
  } else {
    const trueStatement = damaging ? "damaging" : "in good faith";
    const falseStatement = damaging ? "not damaging" : "in bad faith";
    var tempContent =
      "<div class='apirow'><strong>Loading...</strong><progress/></div>";
    var head =
      '<div class="main"><strong>Revision ID: </strong><a href="https://en.wikipedia.org/w/index.php?title=&diff=prev&oldid=' +
      d.rev_id +
      '" target="_blank">' +
      d.rev_id +
      "</a><div class='row'>" +
      "\n<div><strong>Prediction: </strong>" +
      (d.predict ? trueStatement : falseStatement) +
      "</div>\n<div><strong>Actual: </strong>" +
      (d.predict === d.correct ? trueStatement : falseStatement) +
      '</div></div><div class="row"><div style="width: 100%;"><strong>User Info: </strong>' +
      (d.newcomer ? "Newcomer" : "Experienced") +
      " and " +
      (d.anonymous ? "Anonymous" : "Logged-In") +
      "</div>\n</div></div>\n";

    getDiff(d.rev_id).then((res) => div.html(head + res));
    div.html(head + tempContent);
  }

  div.style("position", "absolute").style("left", x(d.x) + "px");
  let topOffset = d.y + margin.top;
  let tooltipHeight = Number.parseInt(div.style("height"));
  if (topOffset + tooltipHeight > height + 100)
    topOffset = topOffset - tooltipHeight;
  div.style("top", topOffset + "px");
}

export default loadDiff;

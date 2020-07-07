import * as d3 from "d3";
import axios from "axios";

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
          "<strong>Wiki Title: </strong>" +
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

        if (rev.comment != "") {
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

  if (articleInfo != "" || diffInfo != "")
    return "<div class='apirow'>" + articleInfo + diffInfo + "</div>";

  return "";
}

export function loadDiff(d, damaging, x, margin, height, parent) {
  console.log("chart click");
  var div = d3.select(parent).append("div").attr("class", "tooltip");

  const trueStatement = damaging ? "damaging" : "in good faith";
  const falseStatement = damaging ? "not damaging" : "in bad faith";

  var tempContent = "<div class='apirow'>Loading...<progress/></div>";
  var head =
    '<div class="main"><strong>Rev. ID: </strong><a href="https://en.wikipedia.org/w/index.php?title=&diff=prev&oldid=' +
    d.rev_id +
    '" target="_blank">' +
    d.rev_id +
    "</a><div class='row'>" +
    "\n<div><strong>Prediction: </strong>" +
    (d.predict ? trueStatement : falseStatement) +
    "</div>\n<div><strong>Actual: </strong>" +
    (d.predict === d.correct ? trueStatement : falseStatement) +
    "</div></div></div>\n";

  getDiff(d.rev_id).then((res) => div.html(head + res));

  div
    .html(head + tempContent)
    .style("position", "absolute")
    .style("left", x(d.x) + "px");

  let topOffset = d.y + margin.top;
  let tooltipHegiht = Number.parseInt(div.style("height"));

  if (topOffset + tooltipHegiht > height + 100)
    topOffset = topOffset - tooltipHegiht;
  div.style("top", topOffset + "px");
}

export default loadDiff;

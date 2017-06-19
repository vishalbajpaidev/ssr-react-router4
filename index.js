'use strict';
var createElement = require('react').createElement;
var React = require("react-router");
var Provider = require("react-redux").Provider;
var renderToString = require("react-dom/server").renderToString;
var preLoadStore = require("./preLoadStore").default;
var StaticRouter = require("react-router").StaticRouter;


/**
 * Module exports.
 * @public
 */

module.exports = ssr;

function ssr(config,cb) {
  // console.log("++++++++++++++++++++++++++++++",JSON.stringify(config))
  var App = config.App;
  var routes = config.routes;
  var store = config.store;
  var url = (config.url).split("?")[0];
  var query = config.query;
  if(typeof App !== "function") throw Error("App should be a function.")
  if(typeof routes !== "object") throw Error("routes should be an Object.")
  if(typeof query !== "object") throw Error("query should be an Object.")
  if(typeof url !== "string") throw Error("url should be a string.",url)
  try{
  preLoadStore({uri:url,query:query},store,routes).then(() => {
    // console.log("==========Got init data in store ==========");
    let context = {};
    // Render the component to a string
    const html = renderToString(
        createElement(
            StaticRouter,
            { location: url, context: context },
            createElement(
                Provider,
                { store: store },
                createElement(App, null)
            )
        )
    );
    // Send the rendered page back to the client
    if(cb) cb(null,html)
  })

  }catch(err){
    console.log("something went wrong ",err);
    if(cb) cb(err,"");
  }
}

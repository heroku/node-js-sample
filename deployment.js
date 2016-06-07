#!/usr/local/bin/node
var SimpleDeployment = require("codedeploy-scripts").SimpleDeployment;
var deployment = new SimpleDeployment({
    appName: "deploytest",
    nodePort: "5000",
    serverScript: "server.js",
    domains: "deploytest.example.com",
    buildFolder: "build",
    staticFolder: "static"
});
deployment.run();
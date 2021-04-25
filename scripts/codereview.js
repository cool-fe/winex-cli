#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const packsge = require("../package.json");

// 获取gitlab 注入ci的环境变量
const { CI_PROJECT_NAME = packsge.name, CI_PROJECT_ID } = process.env;
// 基于gitlab的项目id生成一个sonar的projectKey
const projectBuffer = Buffer.from("sonar" + CI_PROJECT_ID);
const projectKey = "h5" || projectBuffer.toString("hex");

// 检测代码目录
// 一般来说 src都是前端项目业务代码的目录
//因为公司的nodejs项目是基于egg框架的,也有可能是app
const existsSrc = fs.existsSync(`${process.cwd()}/packages/`);

// sonar配置文件模板
const sonarProject = `
sonar.projectKey=${projectKey} 

sonar.projectName=${CI_PROJECT_NAME}

sonar.projectVersion=1.0

sonar.sources=${existsSrc ? "packages" : "."}

sonar.binaries=bin

sonar.host.url=http://tzedu-hd2-sonarqube01.shiguangkey.com:9000

sonar.login=1aa6402ca9532b65db1946db9745a02b958628cf

sonar.sourceEncoding=UTF-8
`;
// 生成一个路径
const sPath = path.resolve(process.cwd(), "sonar-project.properties");

// 写入sonar的配置
fs.writeFileSync(sPath, sonarProject);

// 执行sonar的代码扫描,并且上传代码质量报告
// shelljs.exec("yarn run sonar-scanner");

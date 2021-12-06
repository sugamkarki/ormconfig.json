#!/usr/bin/env node

const exec = require("child_process").exec;
const { writeFile, readdir, readFile } = require("fs").promises;
const inquirer = require("inquirer");
const path = require("path");
const YAML = require("json-to-pretty-yaml");
//
const configFiles = {};
const configFolderPath = path.resolve(__dirname, "config");
(async () => {
  const files = await readdir(configFolderPath).catch(console.log);
  if (!files) return;
  for (let i of files) {
    const frameworkName = i.split(".")[1];
    configFiles[frameworkName] = path.join(configFolderPath, i);
  }
  const { database } = await inquirer.prompt([
    {
      type: "list",
      message: "Pick the database you're using:",
      name: "database",
      default: "postgres(Default)",
      choices: Object.keys(configFiles),
    },
  ]);
  const { extension } = await inquirer.prompt([
    {
      type: "list",
      message: "Select your preferred extension:",
      name: "extension",
      default: "yml",
      choices: ["json", "yml"],
    },
  ]);
  let config = await readFile(configFiles[database]).catch(console.log);
  let ormconfig = path.join(process.cwd(), "ormconfig.json");
  await writeFile(ormconfig, config.toString()).catch((err) => {
    console.log(err);
    process.exit();
  });
  if (extension === "yml") {
    let ormconfig = path.join(process.cwd(), "ormconfig.yml");
    const json = require(path.join(__dirname, "../ormconfig.json"));
    const data = YAML.stringify(json);
    await writeFile(ormconfig, data.toString()).catch((err) => {
      console.log(err);
      process.exit();
    });
  }
})();

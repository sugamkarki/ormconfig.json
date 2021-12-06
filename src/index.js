#!/usr/bin/env node
const exec = require("child_process").exec;
const { writeFile, readdir, readFile } = require("fs").promises;
const inquirer = require("inquirer");
const path = require("path");
const YAML = require("js-yaml");
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
      default: "json",
      choices: ["json", "yml"],
    },
  ]);
  let config = await readFile(configFiles[database]).catch(console.log);
  const json = config.toString();

  let ormconfig = path.join(process.cwd(), `ormconfig.${extension}`);
  if (extension === "json") {
    await writeFile(ormconfig, json).catch((err) => {
      console.log(err);
      process.exit();
    });
  }
  if (extension === "yml") {
    const yml = YAML.dump(JSON.parse(json));
    await writeFile(ormconfig, yml).catch((err) => {
      console.log(err);
      process.exit();
    });
  }
  console.log(`ormconfig.${extension} successfully created!`)
})();

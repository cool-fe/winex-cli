import fs from "fs-extra";
import { runPrompts } from "./prompts";

const addVSCodeAutoFixOnSave = (vscodeObj: {}) => ({
  ...vscodeObj,
  "eslint.autoFixOnSave": true,
});

const createVSCodeConfig = () => {
  return fs
    .readJson("./.vscode/settings.json")
    .then((vsCodeObj: {}) => {
      fs.writeJson(
        "./.vscode/settings.json",
        addVSCodeAutoFixOnSave(vsCodeObj),
        {
          spaces: 2,
        }
      )
        .then(() => {
          console.log(
            "Added VS Code settings in the current project for eslint to execute Prettier."
          );
        })
        .catch((err: any) => {
          console.error(
            "Could not write Prettier config to eslintrc.json",
            err
          );
        });
    })
    .catch(() => {
      console.log("No VS Code settings found. Creating new settings.");
      fs.ensureFile("./.vscode/settings.json")
        .then(() => {
          fs.writeJson(
            "./.vscode/settings.json",
            {
              "eslint.autoFixOnSave": true,
            },
            {
              spaces: 2,
            }
          ).then(() =>
            console.log(
              "Created VS Code settings-file in the current project for eslint to execute Prettier."
            )
          );
        })
        .catch((err: any) => console.log(err));
    });
};

const configEditorrRC = async () => {
  const { type } = await runPrompts({
    type: "select",
    name: "type",
    message: "For which editors do you want a configuration?",
    choices: [
      {
        message: "VS Code",
        name: "code",
      },
      {
        message: "EditorConfig",
        name: "editorConfig",
      },
    ],
  });

  switch (type) {
    case "code":
      await createVSCodeConfig();
      break;

    case "editorConfig":
      console.log("EditorConfig is not yet implemented.");
      break;

    default:
      break;
  }
};
export default configEditorrRC;

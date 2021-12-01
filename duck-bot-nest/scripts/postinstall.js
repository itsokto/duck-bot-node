/* eslint-disable */
// https://github.com/microsoft/vscode-jupyter/blob/main/build/ci/postInstall.js

const { EOL } = require('os');
const fs = require('fs-extra');
const path = require('path');

const updateJSDomTypeDefinition = () => {
  const relativeFilePath = path.join('node_modules', '@types', 'jsdom', 'base.d.ts');
  const filePath = path.join(path.dirname(__dirname), relativeFilePath);
  if (!fs.existsSync(filePath)) {
    console.warn("JSdom base.d.ts not found '" + filePath);
    return;
  }
  const fileContents = fs.readFileSync(filePath, { encoding: 'utf8' });
  const replacedContents = fileContents.replace(
    /\s*globalThis: DOMWindow;\s*readonly \["Infinity"]: number;\s*readonly \["NaN"]: number;/g,
    [
      'globalThis: DOMWindow;',
      '// @ts-ignore',
      'readonly ["Infinity"]: number;',
      '// @ts-ignore',
      'readonly ["NaN"]: number;',
    ].join(`${EOL}        `),
  );
  if (replacedContents === fileContents) {
    console.warn('JSdom base.d.ts not updated');
    return;
  }
  fs.writeFileSync(filePath, replacedContents);
};

updateJSDomTypeDefinition();

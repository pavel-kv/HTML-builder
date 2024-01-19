const path = require('path');
const { stdout } = require('process');
const { createWriteStream, createReadStream } = require('fs');
const {
  readdir,
  mkdir,
  rm,
  copyFile,
  readFile,
  writeFile,
  stat,
} = require('fs/promises');

const PROJECT_FOLDER = 'project-dist';
const STYLES_FOLDER = 'styles';
const ASSETS_FOLDER = 'assets';
const STYLE_FILE = 'style.css';
const HTML_FILE = 'index.html';
const TEMPLATE_FILE = 'template.html';

async function createFolder(_folder) {
  try {
    await rm(_folder, { recursive: true, force: true });
    await mkdir(_folder, { recursive: true });
  } catch (error) {
    stdout.write(
      `An error occurred while creating the folder: ${error.message}\n`,
    );
  }
}

async function readTemplateFile(_file) {
  try {
    const template = await readFile(_file, { encoding: 'utf-8' });
    const templateTags = findTemplateTags(template);
    return { template, templateTags };
  } catch (error) {
    stdout.write(
      `An error occurred while reading the file: ${error.message}\n`,
    );
  }
}

function findTemplateTags(_template) {
  let templateTags = [];
  const tags = _template.matchAll(/{{(.+?)}}/g);
  const results = Array.from(tags);
  for (let result of results) {
    templateTags.push({ replace: result[0], component: result[1] });
  }
  return templateTags;
}

async function readComponents(_templateTags) {
  try {
    const components = {};
    for (let tag of _templateTags) {
      const pathToComponent = path.join(
        __dirname,
        'components',
        `${tag.component}.html`,
      );
      const component = await readFile(pathToComponent, { encoding: 'utf-8' });
      components[tag.component] = component;
    }
    return components;
  } catch (error) {
    stdout.write(`Error: ${error.message}\n`);
  }
}

async function replaceTemplateTagsToComponents({ template, templateTags }) {
  try {
    let file = template;
    const components = await readComponents(templateTags);
    templateTags.forEach((tag) => {
      file = file.replace(tag.replace, components[tag.component]);
    });

    return file;
  } catch (error) {
    stdout.write(`Error: ${error.message}\n`);
  }
}

async function buildStylesBundle(_destinationFolder) {
  const stylesFolder = path.join(__dirname, STYLES_FOLDER);
  const stylesBundleFile = path.join(_destinationFolder, STYLE_FILE);

  const cssBundle = createWriteStream(stylesBundleFile);
  const cssFiles = await readdir(stylesFolder);

  cssFiles.forEach(async (file) => {
    const pathToFile = path.join(stylesFolder, file);
    const fileStat = await stat(pathToFile);

    if (fileStat.isFile() && file.match(/\.css$/)) {
      const cssFile = createReadStream(pathToFile);
      let sccData = '';
      cssFile.on('data', (chunk) => (sccData += chunk));
      cssFile.on('end', () => cssBundle.write(`${sccData}\n`));
      cssFile.on('error', (error) => stdout.write(`Error: ${error.message}\n`));
    }
  });
}

async function copyDirectory(_source, _destination) {
  await createFolder(_destination);

  const files = await readdir(_source);
  for (const file of files) {
    const pathToFile = path.join(_source, file);
    const fileStat = await stat(pathToFile);

    if (fileStat.isFile()) {
      try {
        const srcFile = path.join(_source, file);
        const destFile = path.join(_destination, file);
        await copyFile(srcFile, destFile);
      } catch (error) {
        stdout.write(`Error: ${error.message}\n`);
      }
    } else {
      try {
        const subFolder = path.join(_destination, file);
        await createFolder(subFolder);
        await copyDirectory(
          path.join(_source, file),
          path.join(_destination, file),
        );
      } catch (error) {
        stdout.write(`Error: ${error.message}\n`);
      }
    }
  }
}

(async function () {
  const projectFolder = path.join(__dirname, PROJECT_FOLDER);
  const templateFile = path.join(__dirname, TEMPLATE_FILE);

  await createFolder(projectFolder);

  const { template, templateTags } = await readTemplateFile(templateFile);
  const htmlFileContent = await replaceTemplateTagsToComponents({
    template,
    templateTags,
  });
  const htmlFileFolder = path.join(projectFolder, HTML_FILE);

  await writeFile(htmlFileFolder, htmlFileContent);
  await buildStylesBundle(projectFolder);

  const srcFolder = path.join(__dirname, ASSETS_FOLDER);
  const destFolder = path.join(projectFolder, ASSETS_FOLDER);

  await copyDirectory(srcFolder, destFolder);
})();

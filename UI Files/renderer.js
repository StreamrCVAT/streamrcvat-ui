const { ipcRenderer } = require('electron');
const fs = require('fs');
const watch = require('node-watch');

let objectName;
let counter = 0;

let imageFolderPath;
let imageFiles;

let yoloFolderPath;
let yoloFiles;
let modelBFolderPath;
let modelBFiles;
let linearInterpolationFolderPath;
let linearInterpolationFiles;

let userOutputTextFolderPath;
let userCoordinates = [];

let modelBData = [];
let yoloData = [];
let linearInterpolationData = [];

const promptDialog = () => {
    ipcRenderer.send('getPaths');
};

const saveUserCoordinates = () => {
    if (fs.existsSync(`${userOutputTextFolderPath}\\${counter + 1}.txt`)) {
        userCoordinates = fs
            .readFileSync(`${userOutputTextFolderPath}\\${counter + 1}.txt`, 'utf-8')
            .split(' ');
        userCoordinates.shift();
        fs.writeFileSync(
            `${userOutputTextFolderPath}\\${counter + 1}.txt`,
            `${objectName} ${userCoordinates[0]} ${userCoordinates[1]} ${userCoordinates[2]} ${userCoordinates[3]}`
        );
    } else {
        fs.writeFileSync(
            `${userOutputTextFolderPath}\\${counter + 1}.txt`,
            `${objectName} ${userCoordinates[0]} ${userCoordinates[1]} ${userCoordinates[2]} ${userCoordinates[3]}`
        );
    }
};

const getTextData = (reset = false) => {
    if (reset && !fs.existsSync(`${userOutputTextFolderPath}\\${counter + 1}.txt`)) {
        for (let i = 0; i < modelBData.length; i++) modelBData[i] *= 1;
        userCoordinates = modelBData;
        document.querySelector(
            '.user-coordinates'
        ).innerHTML = `(${modelBData[0]}, ${modelBData[1]}, ${modelBData[2]}, ${modelBData[3]})`;
        makeResizableDiv(...modelBData);
    } else {
        if (fs.existsSync(`${userOutputTextFolderPath}\\${counter + 1}.txt`)) {
            userCoordinates = fs
                .readFileSync(`${userOutputTextFolderPath}\\${counter + 1}.txt`, 'utf-8')
                .split(' ');
            userCoordinates.shift();
            for (let i = 0; i < userCoordinates.length; i++) userCoordinates[i] *= 1;
        }

        if (counter < modelBFiles.length && counter >= 0) {
            if (yoloData.length > 4) yoloData.shift();
            if (modelBData.length > 4) objectName = modelBData.shift();
            if (linearInterpolationData.length > 4) linearInterpolationData.shift();

            for (let i = 0; i < modelBData.length; i++) modelBData[i] *= 1;

            document.querySelector(
                '.yolo-coordinates'
            ).innerHTML = `(${yoloData[0]}, ${yoloData[1]}, ${yoloData[2]}, ${yoloData[3]})`;
            document.querySelector(
                '.modelB-coordinates'
            ).innerHTML = `(${modelBData[0]}, ${modelBData[1]}, ${modelBData[2]}, ${modelBData[3]})`;
            document.querySelector(
                '.linear-interpolation-coordinates'
            ).innerHTML = `(${linearInterpolationData[0]}, ${linearInterpolationData[1]}, ${linearInterpolationData[2]}, ${linearInterpolationData[3]})`;

            if (userCoordinates.length !== 0) {
                document.querySelector(
                    '.user-coordinates'
                ).innerHTML = `(${userCoordinates[0]}, ${userCoordinates[1]}, ${userCoordinates[2]}, ${userCoordinates[3]})`;
                makeResizableDiv(...userCoordinates);
            } else {
                document.querySelector(
                    '.user-coordinates'
                ).innerHTML = `(${modelBData[0]}, ${modelBData[1]}, ${modelBData[2]}, ${modelBData[3]})`;
                makeResizableDiv(...modelBData);
            }
        }
    }

    drawYolo(...yoloData);
    drawModelB(...modelBData);
    drawLinearInterpolation(...linearInterpolationData);
};

const drawYolo = (yMin, xMin, yMax, xMax) => {
    let yoloCanva = document.querySelector('.yolo');
    yoloCanva.style.border = '3px solid #120078';
    yoloCanva.style.top = `${yMin}px`;
    yoloCanva.style.left = `${xMin}px`;
    yoloCanva.style.width = `${xMax - xMin}px`;
    yoloCanva.style.height = `${yMax - yMin}px`;
    yoloCanva.style.pointerEvents = 'none';
};

const drawModelB = (yMin, xMin, yMax, xMax) => {
    let modelBCanva = document.querySelector('.modelB');
    modelBCanva.style.border = '3px solid #ea2c62';
    modelBCanva.style.top = `${yMin}px`;
    modelBCanva.style.left = `${xMin}px`;
    modelBCanva.style.width = `${xMax - xMin}px`;
    modelBCanva.style.height = `${yMax - yMin}px`;
    modelBCanva.style.pointerEvents = 'none';
};

const drawLinearInterpolation = (yMin, xMin, yMax, xMax) => {
    let linearInterpolationCanva = document.querySelector('.linear-interpolation');
    linearInterpolationCanva.style.border = '3px solid #28df99';
    linearInterpolationCanva.style.top = `${yMin}px`;
    linearInterpolationCanva.style.left = `${xMin}px`;
    linearInterpolationCanva.style.width = `${xMax - xMin}px`;
    linearInterpolationCanva.style.height = `${yMax - yMin}px`;
    linearInterpolationCanva.style.pointerEvents = 'none';
};

document.querySelector('.btn-upload').addEventListener('click', promptDialog);
document.querySelector('.dummy-text').addEventListener('click', promptDialog);
document.querySelector('.nav').addEventListener('click', () => {
    document.querySelectorAll('.btn--secondary').forEach(btn => {
        btn.classList.toggle('animate-hide-down');
    });
    document.querySelector('.container-right').classList.toggle('animate-hide-right');
});

ipcRenderer.on('getPaths', (event, arg) => {
    imageFolderPath = fs.readFileSync(arg[0]).toString().split('\n')[0].slice(0, -1);
    yoloFolderPath = fs.readFileSync(arg[0]).toString().split('\n')[1].slice(0, -1);
    modelBFolderPath = fs.readFileSync(arg[0]).toString().split('\n')[2].slice(0, -1);
    linearInterpolationFolderPath = fs.readFileSync(arg[0]).toString().split('\n')[3].slice(0, -1);
    userOutputTextFolderPath = fs.readFileSync(arg[0]).toString().split('\n')[4];

    loadInitialComponents();
    controller();
});

const loadInitialComponents = () => {
    imageFiles = fs.readdirSync(imageFolderPath);
    yoloFiles = fs.readdirSync(yoloFolderPath);
    linearInterpolationFiles = fs.readdirSync(linearInterpolationFolderPath);

    document.querySelector('.btn-upload').style.display = 'none';
    document.querySelector('.dummy-text').style.display = 'none';
    document.querySelector('.container-right').classList.remove('hidden');
    document.querySelector('.nav').classList.remove('hidden');
    document.querySelector('.resizable').classList.remove('hidden');
    document.querySelector('.image').src = `${imageFolderPath}\\${imageFiles[0]}`;
    document.querySelectorAll('.btn').forEach(btn => {
        btn.classList.remove('hidden');
    });
};

const controller = () => {
    watch(yoloFolderPath, { recursive: true }, (evt, name) => {
        yoloFiles = fs.readdirSync(yoloFolderPath);
    });

    watch(modelBFolderPath, { recursive: true }, (evt, name) => {
        modelBFiles = fs.readdirSync(modelBFolderPath);
        htmlModelBFilePaths = '';
        modelBFiles.forEach(file => {
            htmlModelBFilePaths += `<li class="file-item">${file}</li>`;
        });
        document.querySelector('.file-list').innerHTML = htmlModelBFilePaths;
        document.querySelector('.file-name').innerHTML = modelBFiles[counter];
    });

    watch(linearInterpolationFolderPath, { recursive: true }, (evt, name) => {
        linearInterpolationFiles = fs.readdirSync(linearInterpolationFolderPath);
    });

    modelBFiles = fs.readdirSync(modelBFolderPath);
    htmlModelBFilePaths = '';
    modelBFiles.forEach(file => {
        htmlModelBFilePaths += `<li class="file-item">${file}</li>`;
    });
    document.querySelector('.file-list').innerHTML = htmlModelBFilePaths;
    document.querySelector('.file-name').innerHTML = modelBFiles[counter];

    document.querySelector('.btn-next').addEventListener('click', () => {
        saveUserCoordinates();

        if (!fs.existsSync(`${userOutputTextFolderPath}\\${counter + 2}.txt`)) {
            document.querySelector('.resizable').style.pointerEvents = 'all';
        } else {
            document.querySelector('.resizable').style.pointerEvents = 'none';
        }

        if (modelBFiles[counter + 1]) {
            fetch('https://localhost:5000/trigger', {
                method: 'post',
                body: JSON.stringify({
                    frame_number: counter + 1,
                    frame_filename: `${counter + 1}.txt`,
                }).then(() => {
                    counter++;
                    userCoordinates = [];
                    document.querySelector('.image').src = `${imageFolderPath}\\${imageFiles[counter]}`;
                    document.querySelector('.file-name').innerHTML = modelBFiles[counter];

                    yoloData = fs
                        .readFileSync(`${yoloFolderPath}\\${yoloFiles[counter]}`, 'utf-8')
                        .split(' ');
                    modelBData = fs
                        .readFileSync(`${modelBFolderPath}\\${modelBFiles[counter]}`, 'utf-8')
                        .split(' ');
                    linearInterpolationData = fs
                        .readFileSync(
                            `${linearInterpolationFolderPath}\\${linearInterpolationFiles[counter]}`,
                            'utf-8'
                        )
                        .split(' ');
                    getTextData();
                }),
            });
        }
    });

    document.querySelector('.btn-save').addEventListener('click', saveUserCoordinates);

    document.querySelector('.btn-previous').addEventListener('click', () => {
        if (counter > 0) {
            counter--;
            userCoordinates = [];
            document.querySelector('.image').src = `${imageFolderPath}\\${imageFiles[counter]}`;
            document.querySelector('.file-name').innerHTML = modelBFiles[counter];

            yoloData = fs.readFileSync(`${yoloFolderPath}\\${yoloFiles[counter]}`, 'utf-8').split(' ');
            modelBData = fs.readFileSync(`${modelBFolderPath}\\${modelBFiles[counter]}`, 'utf-8').split(' ');
            linearInterpolationData = fs
                .readFileSync(
                    `${linearInterpolationFolderPath}\\${linearInterpolationFiles[counter]}`,
                    'utf-8'
                )
                .split(' ');
            getTextData();

            if (fs.existsSync(`${userOutputTextFolderPath}\\${counter}.txt`)) {
                document.querySelector('.resizable').style.pointerEvents = 'none';
            }
        }
    });

    yoloData = fs.readFileSync(`${yoloFolderPath}\\${yoloFiles[0]}`, 'utf-8').split(' ');
    modelBData = fs.readFileSync(`${modelBFolderPath}\\${modelBFiles[0]}`, 'utf-8').split(' ');
    linearInterpolationData = fs
        .readFileSync(`${linearInterpolationFolderPath}\\${linearInterpolationFiles[0]}`, 'utf-8')
        .split(' ');
    getTextData();
};

document.querySelector('.btn-reset').addEventListener('click', () => {
    modelBData = fs.readFileSync(`${modelBFolderPath}\\${modelBFiles[counter]}`, 'utf-8').split(' ');
    modelBData.shift();
    getTextData(true);
});

document.querySelector('.coordinates-box-yolo').addEventListener('click', () => {
    document.querySelector('.coordinates-name-yolo').classList.toggle('opacity-half');
    document.querySelector('.coordinates-box-yolo').classList.toggle('opacity-half');
    document.querySelector('.yolo').classList.toggle('opacity-zero');
});

document.querySelector('.coordinates-box-modelB').addEventListener('click', () => {
    document.querySelector('.coordinates-name-modelB').classList.toggle('opacity-half');
    document.querySelector('.coordinates-box-modelB').classList.toggle('opacity-half');
    document.querySelector('.modelB').classList.toggle('opacity-zero');
});

document.querySelector('.coordinates-box-linear-interpolation').addEventListener('click', () => {
    document.querySelector('.coordinates-name-linear-interpolation').classList.toggle('opacity-half');
    document.querySelector('.coordinates-box-linear-interpolation').classList.toggle('opacity-half');
    document.querySelector('.linear-interpolation').classList.toggle('opacity-zero');
});

const makeResizableDiv = (yMin, xMin, yMax, xMax) => {
    userCoordinates = modelBData;

    const element = document.querySelector('.resizable');
    const resizers = document.querySelectorAll('.resizable .resizer');
    const minimum_size = 20;

    let original_width = 0;
    let original_height = 0;
    let original_x = 0;
    let original_y = 0;
    let original_mouse_x = 0;
    let original_mouse_y = 0;

    document.querySelector('.resizable').style.top = `${yMin}px`;
    document.querySelector('.resizable').style.left = `${xMin}px`;
    document.querySelector('.resizable').style.height = `${yMax - yMin}px`;
    document.querySelector('.resizable').style.width = `${xMax - xMin}px`;

    for (let i = 0; i < resizers.length; i++) {
        const currentResizer = resizers[i];

        currentResizer.addEventListener('mousedown', function (e) {
            e.preventDefault();

            original_width = parseFloat(
                getComputedStyle(element, null).getPropertyValue('width').replace('px', '')
            );

            original_height = parseFloat(
                getComputedStyle(element, null).getPropertyValue('height').replace('px', '')
            );

            original_x = element.getBoundingClientRect().left;
            original_y = element.getBoundingClientRect().top;
            original_mouse_x = e.pageX;
            original_mouse_y = e.pageY;

            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResize);
        });

        function resize(e) {
            if (currentResizer.classList.contains('bottom-right')) {
                const width = original_width + (e.pageX - original_mouse_x);
                const height = original_height + (e.pageY - original_mouse_y);

                if (width > minimum_size) element.style.width = width + 'px';
                if (height > minimum_size) element.style.height = height + 'px';

                userCoordinates[2] = e.pageY;
                userCoordinates[3] = e.pageX;
            } else if (currentResizer.classList.contains('bottom-left')) {
                const height = original_height + (e.pageY - original_mouse_y);
                const width = original_width - (e.pageX - original_mouse_x);

                if (height > minimum_size) element.style.height = height + 'px';
                if (width > minimum_size) {
                    element.style.width = width + 'px';
                    element.style.left = original_x + (e.pageX - original_mouse_x) + 'px';
                }

                userCoordinates[1] = e.pageX;
                userCoordinates[2] = e.pageY;
            } else if (currentResizer.classList.contains('top-right')) {
                const width = original_width + (e.pageX - original_mouse_x);
                const height = original_height - (e.pageY - original_mouse_y);

                if (width > minimum_size) element.style.width = width + 'px';
                if (height > minimum_size) {
                    element.style.height = height + 'px';
                    element.style.top = original_y + (e.pageY - original_mouse_y) + 'px';
                }

                userCoordinates[0] = e.pageY;
                userCoordinates[3] = e.pageX;
            } else {
                const width = original_width - (e.pageX - original_mouse_x);
                const height = original_height - (e.pageY - original_mouse_y);

                if (width > minimum_size) {
                    element.style.width = width + 'px';
                    element.style.left = original_x + (e.pageX - original_mouse_x) + 'px';
                }
                if (height > minimum_size) {
                    element.style.height = height + 'px';
                    element.style.top = original_y + (e.pageY - original_mouse_y) + 'px';
                }

                userCoordinates[0] = e.pageY;
                userCoordinates[1] = e.pageX;
            }
            document.querySelector(
                '.user-coordinates'
            ).innerHTML = `(${userCoordinates[0]}, ${userCoordinates[1]}, ${userCoordinates[2]}, ${userCoordinates[3]})`;
        }

        function stopResize() {
            window.removeEventListener('mousemove', resize);
        }
    }
};

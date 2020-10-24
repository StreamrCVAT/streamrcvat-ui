const { ipcRenderer } = require('electron');
const fs = require('fs');
const watch = require('node-watch');

let objectName;
let counter = 0;

let imageFolderPath;
let imageFiles;

let textFolderPath;
let textFiles;

let userOutputTextFolderPath;
let userCoordinates = [];

let data = [];

const promptDialog = () => {
    ipcRenderer.send('openImageFolderWindow');
    ipcRenderer.send('openTextFolderWindow');
    ipcRenderer.send('openUserOutputTextFolderWindow');
};

const saveUserCoordinates = () => {
    if (fs.existsSync(`${userOutputTextFolderPath}\\${counter + 1}.txt`)) {
        userCoordinates = fs
            .readFileSync(`${userOutputTextFolderPath}\\${counter + 1}.txt`, 'utf-8')
            .split(' ');
        userCoordinates.shift();
        fs.writeFileSync(
            `${userOutputTextFolderPath}\\${counter + 1}.txt`,
            `${objectName} ${userCoordinates[0]} ${userCoordinates[1]} ${userCoordinates[2]} ${userCoordinates[3]}`,
        );
    } else {
        fs.writeFileSync(
            `${userOutputTextFolderPath}\\${counter + 1}.txt`,
            `${objectName} ${userCoordinates[0]} ${userCoordinates[1]} ${userCoordinates[2]} ${userCoordinates[3]}`,
        );
    }
};

const getTextData = (data, reset = false) => {
    if (reset && !fs.existsSync(`${userOutputTextFolderPath}\\${counter + 1}.txt`)) {
        for (let i = 0; i < data.length; i++) data[i] *= 1;
        userCoordinates = data;
        document.querySelector(
            '.new-coordinates',
        ).innerHTML = `(${data[0]}, ${data[1]}, ${data[2]}, ${data[3]})`;
        makeResizableDiv(...data);
    } else {
        if (fs.existsSync(`${userOutputTextFolderPath}\\${counter + 1}.txt`)) {
            userCoordinates = fs
                .readFileSync(`${userOutputTextFolderPath}\\${counter + 1}.txt`, 'utf-8')
                .split(' ');
            userCoordinates.shift();
            for (let i = 0; i < userCoordinates.length; i++) userCoordinates[i] *= 1;
        }

        if (counter < textFiles.length && counter >= 0) {
            if (data.length > 4) objectName = data.shift();

            for (let i = 0; i < data.length; i++) data[i] *= 1;

            document.querySelector(
                '.old-coordinates',
            ).innerHTML = `(${data[0]}, ${data[1]}, ${data[2]}, ${data[3]})`;

            if (userCoordinates.length !== 0) {
                document.querySelector(
                    '.new-coordinates',
                ).innerHTML = `(${userCoordinates[0]}, ${userCoordinates[1]}, ${userCoordinates[2]}, ${userCoordinates[3]})`;
                makeResizableDiv(...userCoordinates);
            } else {
                document.querySelector(
                    '.new-coordinates',
                ).innerHTML = `(${data[0]}, ${data[1]}, ${data[2]}, ${data[3]})`;
                makeResizableDiv(...data);
            }
        }
    }
};

document.querySelector('.btn-upload').addEventListener('click', promptDialog);
document.querySelector('.dummy-text').addEventListener('click', promptDialog);
document.querySelector('.nav').addEventListener('click', () => {
    document.querySelectorAll('.btn--secondary').forEach(btn => {
        btn.classList.toggle('animate-hide-down');
    });
    document.querySelector('.container-right').classList.toggle('animate-hide-right');
});

ipcRenderer.on('imageFolderPath', (event, arg) => {
    imageFolderPath = arg[0];
    imageFiles = fs.readdirSync(imageFolderPath);

    document.querySelector('.btn-upload').style.display = 'none';
    document.querySelector('.dummy-text').style.display = 'none';
    document.querySelector('.container-right').classList.remove('hidden');
    document.querySelector('.nav').classList.remove('hidden');
    document.querySelector('.resizable').classList.remove('hidden');
    document.querySelector('.image').src = `${imageFolderPath}\\${imageFiles[0]}`;
    document.querySelectorAll('.btn').forEach(btn => {
        btn.classList.remove('hidden');
    });
});

ipcRenderer.on('textFolderPath', (event, arg) => {
    textFolderPath = arg[0];

    watch(textFolderPath, { recursive: true }, (evt, name) => {
        textFiles = fs.readdirSync(textFolderPath);
        htmlFilePaths = '';
        textFiles.forEach(file => {
            htmlFilePaths += `<li class="file-item">${file}</li>`;
        });
        document.querySelector('.file-list').innerHTML = htmlFilePaths;
        document.querySelector('.file-name').innerHTML = textFiles[counter];
    });

    textFiles = fs.readdirSync(textFolderPath);
    htmlFilePaths = '';
    textFiles.forEach(file => {
        htmlFilePaths += `<li class="file-item">${file}</li>`;
    });
    document.querySelector('.file-list').innerHTML = htmlFilePaths;
    document.querySelector('.file-name').innerHTML = textFiles[counter];

    document.querySelector('.btn-next').addEventListener('click', () => {
        saveUserCoordinates();

        if (textFiles[counter + 1]) {
            counter++;
            userCoordinates = [];
            document.querySelector('.image').src = `${imageFolderPath}\\${imageFiles[counter]}`;
            document.querySelector('.file-name').innerHTML = textFiles[counter];

            data = fs.readFileSync(`${textFolderPath}\\${textFiles[counter]}`, 'utf-8').split(' ');
            getTextData(data);
        }
    });

    document.querySelector('.btn-save').addEventListener('click', saveUserCoordinates);

    document.querySelector('.btn-previous').addEventListener('click', () => {
        if (counter > 0) {
            counter--;
            userCoordinates = [];
            document.querySelector('.image').src = `${imageFolderPath}\\${imageFiles[counter]}`;
            document.querySelector('.file-name').innerHTML = textFiles[counter];

            data = fs.readFileSync(`${textFolderPath}\\${textFiles[counter]}`, 'utf-8').split(' ');
            getTextData(data);
        }
    });

    data = fs.readFileSync(`${textFolderPath}\\${textFiles[0]}`, 'utf-8').split(' ');
    getTextData(data);
});

document.querySelector('.btn-reset').addEventListener('click', () => {
    data = fs.readFileSync(`${textFolderPath}\\${textFiles[counter]}`, 'utf-8').split(' ');
    data.shift();
    getTextData(data, true);
});

const makeResizableDiv = (yMin, xMin, yMax, xMax) => {
    userCoordinates = data;

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
                getComputedStyle(element, null).getPropertyValue('width').replace('px', ''),
            );

            original_height = parseFloat(
                getComputedStyle(element, null).getPropertyValue('height').replace('px', ''),
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
                '.new-coordinates',
            ).innerHTML = `(${userCoordinates[0]}, ${userCoordinates[1]}, ${userCoordinates[2]}, ${userCoordinates[3]})`;
        }

        function stopResize() {
            window.removeEventListener('mousemove', resize);
        }
    }
};

ipcRenderer.on('userOutputTextFolderPath', (event, arg) => {
    userOutputTextFolderPath = arg[0];
});

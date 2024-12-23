// Virtual operating system in JavaScript with filesystem manipulation features

document.addEventListener('DOMContentLoaded', () => {
    
    // Load the filesystem from a JSON file
    fetch('filesystem.json')
        .then(response => response.json())
        .then(data => {
            let fileSystem = data;
            let currentDir = fileSystem;
            
            const terminalOutput = document.getElementById('output');
            const welcomeTerminalOutput = document.getElementById('welcome_output');
            const commandInput = document.getElementById('command-input');

            // Funzione per configurare i riferimenti al genitore
            function setParentReferences(directory, parent = null) {
                directory.parent = parent;
                if (directory.children) {
                    for (const key in directory.children) {
                        if (directory.children.hasOwnProperty(key)) {
                            setParentReferences(directory.children[key], directory);
                        }
                    }
                }
            }
            // Configura i riferimenti al genitore nel filesystem
            setParentReferences(fileSystem);

            // Display the welcome message
            welcomeTerminalOutput.innerHTML += `<div>Welcome on JBOS Version 0.0.1</div><div>-----Plankton-----</div>`;

            // Function to process commands entered by the user
            commandInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    const command = commandInput.value.trim();
                    processCommand(command);
                    commandInput.value = '';
                }
            });

            function processCommand(command) {
                const parts = command.split(' ');
                const cmd = parts[0];
                const arg = parts.slice(1).join(' ');
                let output = '';

                switch (cmd) {
                    case 'ls':
                        output = listFiles(currentDir);
                        break;
                    case 'cd':
                        output = changeDirectory(arg);
                        break;
                    case 'mkdir':
                        output = createDirectory(arg);
                        break;
                    case 'touch':
                        output = createFile(arg);
                        break;
                    case 'rm':
                        output = removeItem(arg);
                        break;
                    case 'pwd':
                        output = printWorkingDirectory(currentDir);
                        break;
                    case 'help':
                        output = 'Available commands: ls, cd, mkdir, touch, rm, pwd, help';
                        break;
                    default:
                        output = `Command "${cmd}" not recognized. Type 'help' to see the list of available commands.`;
                }

                terminalOutput.innerHTML += `<div>${command}</div><div>${output}</div>`;
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            }

            function listFiles(directory) {
                const childrenNames = Object.keys(directory.children);
                return childrenNames.length > 0 ? childrenNames.join(' ') : 'The directory is empty';
            }

            function changeDirectory(path) {
                if (path === '..') {
                    if (currentDir.parent) {
                        currentDir = currentDir.parent;
                        return `Returned to directory: ${currentDir.name}`;
                    } else {
                        return 'You are already at the root.';
                    }
                } else if (currentDir.children[path] && currentDir.children[path].type === 'directory') {
                    currentDir = currentDir.children[path];
                    return `Entered directory: ${currentDir.name}`;
                } else {
                    return `Directory "${path}" not found.`;
                }
            }
            
            function createDirectory(name) {
                if (currentDir.children[name]) {
                    return `The directory "${name}" already exists.`;
                } else {
                    currentDir.children[name] = {
                        name: name,
                        type: 'directory',
                        parent: currentDir,
                        children: {}
                    };
                    return `Directory "${name}" successfully created.`;
                }
            }

            function createFile(name) {
                if (currentDir.children[name]) {
                    return `The file "${name}" already exists.`;
                } else {
                    currentDir.children[name] = {
                        name: name,
                        type: 'file',
                        parent: currentDir,
                        content: ''
                    };
                    return `File "${name}" successfully created.`;
                }
            }

            function removeItem(name) {
                if (currentDir.children[name]) {
                    delete currentDir.children[name];
                    return `"${name}" successfully removed.`;
                } else {
                    return `"${name}" not found.`;
                }
            }

            function printWorkingDirectory(directory) {
                let path = '';
                let current = directory;
                while (current) {
                    path = '/' + current.name + path;
                    current = current.parent;
                }
                return path;
            }
        })
        .catch(error => {
            console.error('Error loading the filesystem:', error);
        });
});
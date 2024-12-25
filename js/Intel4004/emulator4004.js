class Register4Bit {
    constructor() {
        this.value = 0;
    }

    load(data) {
        this.value = data & 0xF; // Mantieni solo i 4 bit meno significativi
    }

    clear() {
        this.value = 0;
    }

    getValue() {
        return this.value;
    }
}

class Memory {
    constructor(size) {
        this.data = new Array(size).fill(0);
    }

    load(address, value) {
        if (address >= 0 && address < this.data.length) {
            this.data[address] = value & 0xF; // Memorizza solo 4 bit
        } else {
            throw new Error(`Address ${address} outside limits`);
        }
    }

    fetch(address) {
        if (address >= 0 && address < this.data.length) {
            return this.data[address];
        } else {
            throw new Error(`Address ${address} outside limits`);
        }
    }

    getState() {
        return this.data.map((val, idx) => `M[${idx}]: ${val}`).join(", ");
    }
}

class CPU {
    constructor() {
        this.registers = [new Register4Bit(), new Register4Bit()]; // Due registri per semplicità
        this.memory = new Memory(16); // Memoria di 16 celle
        this.pc = new Register4Bit(); // Program Counter (4 bit)
        this.running = false;
    }

    executeInstruction(instruction) {
        const [op, arg] = instruction.split(' ');

        switch (op.toUpperCase()) {
            case 'LOAD':
                this.registers[0].load(this.memory.fetch(parseInt(arg, 16)));
                break;
            case 'STORE':
                this.memory.load(parseInt(arg, 16), this.registers[0].getValue());
                break;
            case 'ADD':
                const value = this.memory.fetch(parseInt(arg, 16));
                const result = this.registers[0].getValue() + value;
                this.registers[0].load(result);
                break;
            case 'SUB':
                const subValue = this.memory.fetch(parseInt(arg, 16));
                const subResult = this.registers[0].getValue() - subValue;
                this.registers[0].load(subResult);
                break;
            case 'JUMP':
                this.pc.load(parseInt(arg, 16));
                break;
            case 'JMPZ':
                if (this.registers[0].getValue() === 0) {
                    this.pc.load(parseInt(arg, 16));
                }
                break;
            case 'NOP':
                break; // Non fa nulla
            default:
                throw new Error(`Invalid instruction: ${op}`);
        }
    }

    step() {
        const instruction = this.memory.fetch(this.pc.getValue());
        this.executeInstruction(instruction);
        this.pc.load(this.pc.getValue() + 1);
    }

    getState() {
        return {
            PC: this.pc.getValue(),
            Registers: this.registers.map((r, i) => `R${i}: ${r.getValue()}`).join(", "),
            Memory: this.memory.getState(),
        };
    }
}

const terminal = document.getElementById('terminal');
const input = document.getElementById('input');
const cpu = new CPU();

function printToTerminal(message) {
    terminal.innerHTML += `${message}\n`;
    terminal.scrollTop = terminal.scrollHeight; // Scroll automatico
}

function updateVisualState() {
    const memoryDiv = document.getElementById('memory');
    const registersDiv = document.getElementById('registers');

    memoryDiv.innerHTML = cpu.memory.data.map((val, idx) => `<div>M[${idx}]: ${val}</div>`).join('');
    registersDiv.innerHTML = cpu.registers.map((r, i) => `<div>R${i}: ${r.getValue()}</div>`).join('');
}

function processCommand(command) {
    try {
        const [cmd, ...args] = command.split(' ');

        switch (cmd.toUpperCase()) {
            case 'LOAD':
                const [address, value] = args;
                cpu.memory.load(parseInt(address, 16), parseInt(value, 16));
                printToTerminal(`Load ${value} in M[${address}]`);
                break;

            case 'EXEC':
                const instruction = args.join(' ');
                cpu.executeInstruction(instruction);
                printToTerminal(`Executed: ${instruction}`);
                break;

            case 'STATE':
                const state = cpu.getState();
                printToTerminal(`PC: ${state.PC}`);
                printToTerminal(`Registers: ${state.Registers}`);
                printToTerminal(`Memory: ${state.Memory}`);
                break;

            case 'STEP':
                cpu.step();
                printToTerminal("Next instruction executed.");
                break;

            case 'RUN':
                runProgram();
                break;

            default:
                printToTerminal(`Unknown command: ${cmd}`);
        }
        updateVisualState(); // Aggiorna lo stato grafico
    } catch (error) {
        printToTerminal(`Error: ${error.message}`);
    }
}

function runProgram() {
    try {
        printToTerminal("Start program execution...");
        while (true) {
            cpu.step(); // Esegui la prossima istruzione
            const state = cpu.getState();
            printToTerminal(`PC: ${state.PC}`);
            printToTerminal(`Registers: ${state.Registers}`);
            printToTerminal(`Memory: ${state.Memory}`);
        }
    } catch (error) {
        printToTerminal(`execution completes: ${error.message}`);
    }
}

input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const command = input.value.trim();
        input.value = ''; // Pulisce l'input
        processCommand(command);
    }
});

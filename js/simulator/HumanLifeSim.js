const canvas = document.getElementById("simulator");
const ctx = canvas.getContext("2d");
const chartCtx = document.getElementById("chart").getContext("2d");

const width = canvas.width;
const height = canvas.height;

// Generazione di variabili casuali
const MAX_ENERGY = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
const BIRTH_THRESHOLD = 1000;
const RESOURCE_COUNT = Math.floor(Math.random() * (1000 - 10 + 1)) + 10;
const PEOPLE_COUNT = Math.floor(Math.random() * (1000 - 10 + 1)) + 10;
const DEATH_AGE = Math.floor(Math.random() * (100 - 0 + 1));
const resourceTypes = ["cibo", "acqua", "legno", "metalli"];
let cycle = 0;
const simulationSpeed = 500; // Tempo in millisecondi tra gli aggiornamenti

// Mostra i dati a video nella sezione principale
function showInfo() {
    const mainSection = document.querySelector("main.project-page");
    if (mainSection) {
        const infoDiv = document.createElement("div");
        infoDiv.className = "simulation-info";
        infoDiv.style.textAlign = "center";
        infoDiv.style.margin = "20px";
        infoDiv.innerHTML = `
            <h3>Simulation Parameters:</h3>
            <p><strong>MAX_ENERGY:</strong> ${MAX_ENERGY}</p>
            <p><strong>BIRTH_THRESHOLD:</strong> ${BIRTH_THRESHOLD}</p>
            <p><strong>RESOURCE_COUNT:</strong> ${RESOURCE_COUNT}</p>
            <p><strong>PEOPLE_COUNT:</strong> ${PEOPLE_COUNT}</p>
            <p><strong>DEATH_AGE:</strong> ${DEATH_AGE}</p>
        `;
        mainSection.insertBefore(infoDiv, mainSection.querySelector("section"));

        const legendDiv = document.createElement("div");
        legendDiv.className = "simulation-legend";
        legendDiv.style.textAlign = "center";
        legendDiv.style.margin = "20px";
        legendDiv.innerHTML = `
            <h3>Legend:</h3>
            <ul style="list-style: none; padding: 0;">
                <ul style="list-style: none; padding: 0;"> <h4>--- Human ---</h4>
                <li><span style="color: red; font-weight: bold;">●</span> Aggressive</li>
                <li><span style="color: green; font-weight: bold;">●</span> Cooperative</li>
                <li><span style="color: blue; font-weight: bold;">●</span> Lonely</li>
                <li><span style="color: black; font-weight: bold;">●</span> Deceased</li>
                </ul>
                <ul style="list-style: none; padding: 0;"> <h4>---  Resources ---</h4>
                <li><span style="color: green; font-weight: bold;">■</span> Food</li>
                <li><span style="color: blue; font-weight: bold;">■</span> Water</li>
                <li><span style="color: brown; font-weight: bold;">■</span> Wood</li>
                <li><span style="color: gray; font-weight: bold;">■</span> Metals</li>
                </ul>
            </ul>
        `;
        mainSection.insertBefore(legendDiv, mainSection.querySelector("section"));
    } else {
        console.error("main.project-page not found");
    }
}
showInfo();

class Person {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 5;
        this.age = 0;
        this.energy = Math.random() * MAX_ENERGY;
        this.trait = this.getRandomTrait();
        this.color = this.getColor();
    }

    getRandomTrait() {
        const traits = ["aggressivo", "cooperativo", "solitario"];
        return traits[Math.floor(Math.random() * traits.length)];
    }

    getColor() {
        switch (this.trait) {
            case "aggressivo": return "red";
            case "cooperativo": return "green";
            case "solitario": return "blue";
        }
    }

    move() {
        this.x += (Math.random() - 0.5) * 5;
        this.y += (Math.random() - 0.5) * 5;
        this.x = Math.max(0, Math.min(width, this.x));
        this.y = Math.max(0, Math.min(height, this.y));
    }

    grow() {
        this.age++;
        this.energy -= 0.1;
        if (this.energy <= 0 || this.age >= DEATH_AGE) {
            this.die();
        }
    }

    eat(resources) {
        resources.forEach(resource => {
            const dist = Math.hypot(this.x - resource.x, this.y - resource.y);
            if (dist < this.size + resource.size) {
                this.energy = Math.min(MAX_ENERGY, this.energy + 20);
                resource.respawn();
            }
        });
    }

    interact(people) {
        people.forEach(other => {
            if (other !== this) {
                const dist = Math.hypot(this.x - other.x, this.y - other.y);
                if (dist < 20) {
                    if (this.trait === "aggressivo") {
                        other.energy -= 5;
                        this.energy += 5;
                    } else if (this.trait === "cooperativo") {
                        other.energy += 2;
                        this.energy -= 2;
                    }

                    if (this.energy > BIRTH_THRESHOLD) {
                        const newPerson = new Person(this.x, this.y);
                        newPerson.trait = inheritTraits(this, other);
                        people.push(newPerson);
                        this.energy -= 30;
                    }
                }
            }
        });
    }

    die() {
        this.color = "black";
        this.size = 0;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Resource {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.size = 6; // Quadrato di 6x6
        this.color = this.getColor();
    }

    getColor() {
        switch (this.type) {
            case "cibo": return "green";
            case "acqua": return "blue";
            case "legno": return "brown";
            case "metalli": return "gray";
        }
    }

    respawn() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
}

function inheritTraits(parent1, parent2) {
    const traits = [parent1.trait, parent2.trait];
    return traits[Math.floor(Math.random() * traits.length)];
}

const people = [];
for (let i = 0; i < PEOPLE_COUNT; i++) {
    people.push(new Person(Math.random() * width, Math.random() * height));
}

const resources = [];
for (let i = 0; i < RESOURCE_COUNT; i++) {
    const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    resources.push(new Resource(type, Math.random() * width, Math.random() * height));
}

const populationData = [];
const energyData = [];
const resourcesData = [];

const chart = new Chart(chartCtx, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            { label: "Popolazione", borderColor: "blue", data: populationData },
            { label: "Energia Media", borderColor: "green", data: energyData },
            { label: "Risorse Totali", borderColor: "orange", data: resourcesData },
        ],
    },
    options: {
        responsive: true,
        scales: {
            x: { title: { display: true, text: "Tempo (Cicli)" } },
            y: { title: { display: true, text: "Valori" } },
        },
    },
});

function updateChart(cycle) {
    const totalEnergy = people.reduce((sum, p) => sum + (p.energy || 0), 0) / people.length;
    const totalResources = resources.length;

    populationData.push(people.filter(p => p.size > 0).length);
    energyData.push(totalEnergy.toFixed(2));
    resourcesData.push(totalResources);

    chart.data.labels.push(cycle);
    chart.update();
}

function triggerEvent(cycle) {
    if (cycle % 50 === 0) {
        const event = Math.random() < 0.5 ? "carestia" : "tempesta";
        if (event === "carestia") {
            resources.splice(0, Math.floor(resources.length / 2));
            console.log("Evento: Carestia! Risorse dimezzate.");
        } else if (event === "tempesta") {
            people.splice(0, Math.floor(people.length / 4));
            console.log("Evento: Tempesta! Persone decimate.");
        }
    }
}

function update() {
    ctx.clearRect(0, 0, width, height);

    resources.forEach(resource => resource.draw(ctx));
    people.forEach(person => {
        if (person.size > 0) {
            person.move();
            person.grow();
            person.eat(resources);
            person.interact(people);
        }
        person.draw(ctx);
    });

    triggerEvent(cycle);
    updateChart(cycle);
    cycle++;

    setTimeout(update, simulationSpeed); // Rallenta la simulazione
}

update();

// Smooth scroll for navigation
document.querySelectorAll('.nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

// Seleziona le immagini e i pulsanti
const skillImages = document.querySelectorAll('.carousel-image');
const prevButton = document.querySelector('.prev-btn');
const nextButton = document.querySelector('.next-btn');

let currentSkillIndex = 0;

// Funzione per aggiornare l'immagine visibile
function updateSkillsCarousel(index) {
  skillImages.forEach((img, i) => {
    img.classList.toggle('active', i === index);
  });
}

// Evento per pulsante "Avanti"
nextButton.addEventListener('click', () => {
  currentSkillIndex = (currentSkillIndex + 1) % skillImages.length;
  updateSkillsCarousel(currentSkillIndex);
});

// Evento per pulsante "Indietro"
prevButton.addEventListener('click', () => {
  currentSkillIndex = (currentSkillIndex - 1 + skillImages.length) % skillImages.length;
  updateSkillsCarousel(currentSkillIndex);
});

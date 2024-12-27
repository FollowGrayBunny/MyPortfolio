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

// Seleziona gli elementi del carousel dei post
const postTrack = document.querySelector('.post-carousel-track');
const postPrevBtn = document.querySelector('.post-prev-btn');
const postNextBtn = document.querySelector('.post-next-btn');
const postItems = Array.from(document.querySelectorAll('.post-item'));

let postIndex = 0;
const postWidth = postItems[0].offsetWidth + 20; // Larghezza di un post + gap

// Funzione per aggiornare la posizione del track
function updatePostCarousel() {
  const offset = -(postIndex * postWidth);
  postTrack.style.transform = `translateX(${offset}px)`;
}

// Evento per il pulsante "Avanti"
postNextBtn.addEventListener('click', () => {
  postIndex = (postIndex + 1) % postItems.length; // Torna al primo dopo l'ultimo
  updatePostCarousel();
});

// Evento per il pulsante "Indietro"
postPrevBtn.addEventListener('click', () => {
  postIndex = (postIndex - 1 + postItems.length) % postItems.length; // Torna all'ultimo dopo il primo
  updatePostCarousel();
});

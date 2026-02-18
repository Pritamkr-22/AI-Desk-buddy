/* ================= BUTTON STATES ================= */

const btn = document.getElementById("controlBtn");
const btnIcon = btn.querySelector(".btn-icon i");
const btnText = btn.querySelector(".btn-text");

function setListeningState() {
    btn.className = "try-btn listening";
    btnIcon.className = "fas fa-headphones";
    btnText.textContent = "Listening...";
}

function setThinkingState() {
    btn.className = "try-btn thinking";
    btnIcon.className = "fas fa-spinner";
    btnText.textContent = "Thinking...";
}

function setSpeakingState() {
    btn.className = "try-btn speaking";
    btnIcon.className = "fas fa-volume-up";
    btnText.textContent = "Speaking...";
}

function resetButton() {
    btn.className = "try-btn";
    btnIcon.className = "fas fa-microphone";
    btnText.textContent = "Start Conversation";
}

/* ================= VOICE ================= */

let recognition = null;
let isListening = false;
let currentAudio = null;

function toggleListening() {
    if (!isListening) startListening();
    else stopAll();
}

function startListening() {
    window.SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!window.SpeechRecognition) {
        alert("Speech recognition not supported");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "en-IN";

    isListening = true;
    setListeningState();
    recognition.start();

    recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        recognition.stop();
        setThinkingState();
        sendToBackend(text);
    };

    recognition.onerror = stopAll;
}

async function sendToBackend(text) {
    try {
        const res = await fetch("http://127.0.0.1:8000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });

        const data = await res.json();
        setTimeout(() => playAudio(data.audio_file), 400);

    } catch (err) {
        console.error(err);
        stopAll();
    }
}

function playAudio(file) {
    setSpeakingState();
    currentAudio = new Audio(`http://127.0.0.1:8000/static/${file}`);
    currentAudio.play();
    currentAudio.onended = stopAll;
}

function stopAll() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    if (recognition) recognition.stop();
    isListening = false;
    resetButton();
}

/* ================= MOBILE MENU ================= */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const menuIcon = menuToggle.querySelector("i");

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuIcon.className = navLinks.classList.contains("active")
        ? "fas fa-times"
        : "fas fa-bars";
});

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        menuIcon.className = "fas fa-bars";
    });
});

/* ================= SCROLL ACTIVE NAV ================= */

const sections = document.querySelectorAll("section[id]");
const navItems = document.querySelectorAll(".nav-item a");

window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {
            current = section.getAttribute("id");
        }
    });

    navItems.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }
    });
});

/* ================= COPY CODE ================= */

function copyCode() {
    const code = document.getElementById("codeBlock").innerText;
    navigator.clipboard.writeText(code);
}

/* ================= COMPONENT DROPDOWN ================= */

document.querySelectorAll(".component-title").forEach(button => {
    button.addEventListener("click", () => {
        const item = button.parentElement;

        document.querySelectorAll(".component-item").forEach(i => {
            if (i !== item) i.classList.remove("active");
        });

        item.classList.toggle("active");
    });
});
(function () {
  emailjs.init("vU8spTE_onnpQsrw5"); // Public Key
})();

const contactForm = document.querySelector("#contact-form");
const submitBtn = contactForm.querySelector('input[type="submit"]');

contactForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // prevent multiple clicks
  submitBtn.disabled = true;
  submitBtn.value = "Sending...";

  emailjs.sendForm(
    "service_mddh6mj",      // Service ID
    "template_7cgoc71",     // Template ID
    this
  ).then(
    () => {
      // success
      submitBtn.value = "Message Sent ✓";
      contactForm.reset();

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.value = "Send Message";
      }, 3000);
    },
    (error) => {
      // error
      console.error(error);
      submitBtn.disabled = false;
      submitBtn.value = "Send Message";
      alert("Message not sent ❌ Please try again");
    }
  );
});



function showStatus(message, type) {
  const status = document.getElementById("form-status");
  status.innerText = message;
  status.className = `form-status ${type}`;

  setTimeout(() => {
    status.innerText = "";
    status.className = "form-status";
  }, 4000);
}
const readBtn = document.querySelector(".read-more-btn");
const codeContainer = document.getElementById("codeContainer");

readBtn.addEventListener("click", function () {
    codeContainer.classList.toggle("expanded");

    if (codeContainer.classList.contains("expanded")) {
        readBtn.textContent = "Show Less";
    } else {
        readBtn.textContent = "Read More";
    }
});

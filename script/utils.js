// Monkey patch de la méthode getYTPlayer
const originalGetYTPlayer = LiteYTEmbed.prototype.getYTPlayer;
LiteYTEmbed.prototype.getYTPlayer = async function() {
    return this.playerPromise;
};


function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function isSmallScreen() {
    return window.innerWidth <= 1024
}

function isPhone() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function checkFormValidity() {
    const errorMsg = document.querySelector(".error-msg");
    errorMsg.style.opacity = 0;
    const contactForm = document.getElementById("contact-form");
    console.log("kakou");
    

    const contact = contactForm.querySelector("#contact");
    console.log(contact.value.length);
    
    const message = contactForm.querySelector("#message");

    if(message.value.length == 0) {
        message.focus();
        displayContactError("Je crois que tu as oublié de mettre un message !")
    } else if (message.value.length < 20) {
        message.focus();
        displayContactError("Il va falloir m'en dire un peu plus...")
    } else if (contact.value.length == 0) {
        contact.focus();
        displayContactError("Renseigne ton contact si tu veux une réponse !")
    } else if (!validateContact(contact.value) ) {
        contact.focus();
        displayContactError("Il me faut un mail ou téléphone valide !")
    } else {
        contactForm.submit();
        displayContactError("Votre message a bien été envoyé !")
    }

    function displayContactError(msg) {
        errorMsg.textContent = msg;
        errorMsg.style.opacity = 1;
    }

    function validateContact(contact) {
        const email = /\S+@\S+\.\S+/;
        const phone = /^\d{10}$/
        return email.test(contact) || phone.test(contact);
    }
}

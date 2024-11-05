// Monkey patch de la méthode getYTPlayer
const originalGetYTPlayer = LiteYTEmbed.prototype.getYTPlayer;
LiteYTEmbed.prototype.getYTPlayer = async function() {
    return this.playerPromise;
};


function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function isMobile() {
    return window.innerWidth <= 1024
}

function isPhone() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}
(function () {
  // Replace this with the hash of the resume password (see Step 2)
  var PASSWORD_HASH = "b912b4176482e0c602e840af42e2b57af77c33cde2630cdc1467c5a9665af986";
  var STORAGE_KEY = "resume-unlocked";

  try {
    if (sessionStorage.getItem(STORAGE_KEY) === PASSWORD_HASH) return;
  } catch (e) {}

  function sha256(text) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) {
        return b.toString(16).padStart(2, "0");
      }).join("");
    });
  }

  var overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;" +
    "display:flex;align-items:center;justify-content:center;" +
    "background:linear-gradient(to bottom,#4a4a4a,#ffffff);font-family:Arial,Helvetica,sans-serif;";

  overlay.innerHTML =
    '<div style="background:rgba(255,255,255,0.9);padding:30px;border-radius:10px;text-align:center;max-width:320px;width:90%;">' +
    '<h2 style="margin:0 0 10px;">Password required</h2>' +
    '<p style="margin:0 0 15px;color:#555;">Enter the password to view this page.</p>' +
    '<input id="gate-input" type="password" style="padding:8px;width:100%;box-sizing:border-box;margin-bottom:10px;font-size:1rem;">' +
    '<button id="gate-button" style="padding:8px 20px;font-size:1rem;cursor:pointer;">Enter</button>' +
    '<p id="gate-message" style="color:#b00020;margin:10px 0 0;min-height:1.2em;"></p>' +
    '<p style="margin:10px 0 0;"><a href="index.html">Back to home</a></p>' +
    "</div>";

  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  var input = document.getElementById("gate-input");
  var message = document.getElementById("gate-message");

  function tryUnlock() {
    if (!window.crypto || !crypto.subtle) {
      message.textContent = "This browser can't check passwords here. Try the live site.";
      return;
    }
    sha256(input.value).then(function (hash) {
      if (hash === PASSWORD_HASH) {
        try { sessionStorage.setItem(STORAGE_KEY, PASSWORD_HASH); } catch (e) {}
        overlay.remove();
        document.body.style.overflow = "";
      } else {
        message.textContent = "Wrong password.";
        input.value = "";
      }
    });
  }

  document.getElementById("gate-button").onclick = tryUnlock;
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") tryUnlock();
  });
  input.focus();
})();
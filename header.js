document.getElementById("site-header").innerHTML = `
  <header>
    <h1><a href="index.html">Walker Copeland</a></h1>
    <p class="tagline">Welcome to all things Walker</p>
        <nav>
      <a href="about.html">About</a>
      <a href="calendar.html">Calendar</a>
      <a href="news.html">News</a>
      <a href="ideas.html">Ideas</a>
      <a href="links.html">Links</a>
    </nav>
  </header>
`;

const siteHeader = document.getElementById("site-header");
const siteName = siteHeader.querySelector("h1");
const siteNameLink = siteHeader.querySelector("h1 a");
const siteTagline = siteHeader.querySelector(".tagline");
const siteNav = siteHeader.querySelector("nav");
const siteNavLinks = siteHeader.querySelectorAll("nav a");

function updateHeader() {
  const y = window.scrollY;

  // Fade out the sub line and shrink the name
  const fade = Math.min(y / 150, 1);
  siteTagline.style.opacity = 1 - fade;
  siteTagline.style.maxHeight = (1 - fade) * 3 + "em";
  siteName.style.fontSize = (3 - fade * 1.5) + "rem";

  // White text and borders, always readable on the dark grey top of the gradient
  siteNameLink.style.color = "white";
  siteTagline.style.color = "white";
  siteNavLinks.forEach(function (a) { a.style.color = "white"; });
  siteNav.style.borderTop = "2px solid rgba(255,255,255,0.5)";
  siteNav.style.borderBottom = "2px solid rgba(255,255,255,0.5)";
}

window.addEventListener("scroll", updateHeader);
window.addEventListener("resize", updateHeader);
updateHeader();
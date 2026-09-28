const sections = ["overview", "hardware", "network", "services", "storage", "operations"];

const menuButton = document.querySelector("[data-menu]");
const menu = document.querySelector("[data-menu-panel]");

menuButton?.addEventListener("click", () => {
  const open = menu.hasAttribute("hidden");
  if (open) menu.removeAttribute("hidden");
  else menu.setAttribute("hidden", "");
  menuButton.textContent = open ? "Close" : "Index";
  menuButton.setAttribute("aria-expanded", String(open));
});

menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.setAttribute("hidden", "");
    menuButton.textContent = "Index";
    menuButton.setAttribute("aria-expanded", "false");
  });
});

function selectIn(root, buttonAttr, panelAttr) {
  const buttons = [...root.querySelectorAll(`[${buttonAttr}]`)];
  const panels = [...root.querySelectorAll(`[${panelAttr}]`)];
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute(buttonAttr);
      buttons.forEach((item) => {
        const on = item.getAttribute(buttonAttr) === id;
        item.classList.toggle("is-on", on);
        if (item.hasAttribute("aria-pressed")) item.setAttribute("aria-pressed", String(on));
        if (item.hasAttribute("aria-selected")) item.setAttribute("aria-selected", String(on));
      });
      panels.forEach((panel) => {
        if (panel.getAttribute(panelAttr) === id) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      });
    });
  });
}

selectIn(document.querySelector("#hardware"), "data-machine", "data-machine-panel");
selectIn(document.querySelector("#network"), "data-path", "data-path-panel");
selectIn(document.querySelector("#operations"), "data-case", "data-case-panel");

const serviceRoot = document.querySelector("#services");
const groupButtons = [...serviceRoot.querySelectorAll("[data-group]")];
const serviceButtons = [...serviceRoot.querySelectorAll("[data-service]")];
const servicePanels = [...serviceRoot.querySelectorAll("[data-service-panel]")];

function showService(id) {
  serviceButtons.forEach((button) => {
    const on = button.getAttribute("data-service") === id && !button.hasAttribute("hidden");
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-selected", String(on));
  });
  servicePanels.forEach((panel) => {
    if (panel.getAttribute("data-service-panel") === id) panel.removeAttribute("hidden");
    else panel.setAttribute("hidden", "");
  });
}

function applyGroup(group) {
  groupButtons.forEach((button) => {
    const on = button.getAttribute("data-group") === group;
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-selected", String(on));
  });
  serviceButtons.forEach((button) => {
    const match = group === "All" || button.getAttribute("data-belongs") === group;
    if (match) button.removeAttribute("hidden");
    else button.setAttribute("hidden", "");
  });
  const current = serviceButtons.find((button) => button.classList.contains("is-on") && !button.hasAttribute("hidden"));
  const next = current ?? serviceButtons.find((button) => !button.hasAttribute("hidden"));
  if (next) showService(next.getAttribute("data-service"));
}

groupButtons.forEach((button) => {
  button.addEventListener("click", () => applyGroup(button.getAttribute("data-group")));
});

serviceButtons.forEach((button) => {
  button.addEventListener("click", () => showService(button.getAttribute("data-service")));
});

const navLinks = [...document.querySelectorAll("[data-nav]")];

function setActive(id) {
  navLinks.forEach((link) => {
    const on = link.getAttribute("href") === `#${id}`;
    if (on) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible?.target.id) setActive(visible.target.id);
  },
  { rootMargin: "-30% 0px -55% 0px", threshold: [0.15, 0.4] },
);

sections.forEach((id) => {
  const node = document.getElementById(id);
  if (node) observer.observe(node);
});

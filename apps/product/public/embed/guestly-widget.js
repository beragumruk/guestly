(function () {
  "use strict";

  var DEFAULTS = {
    appUrl: "https://www.getguestly.com",
    organization: "Guestly Demo Workspace",
    location: "Guest Experience",
    reference: "WEB",
    slug: "guestly-demo-front-desk",
    triggerText: "Share feedback",
    mode: "modal",
  };

  var state = {
    instances: [],
    activeRating: null,
  };

  function mergeConfig(node) {
    var config = {};
    Object.keys(DEFAULTS).forEach(function (key) {
      config[key] = node.getAttribute("data-" + kebab(key)) || DEFAULTS[key];
    });
    return config;
  }

  function kebab(value) {
    return value.replace(/[A-Z]/g, function (letter) {
      return "-" + letter.toLowerCase();
    });
  }

  function createElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function markSvg() {
    return [
      '<span class="guestly-embed-mark" aria-hidden="true">',
      '<svg viewBox="0 0 64 64" width="16" height="16">',
      '<path d="M48.8 18.7A22 22 0 1 0 51.6 36H37.2" fill="none" stroke="currentColor" stroke-width="7.5" stroke-linecap="butt" stroke-linejoin="round"/>',
      '<circle cx="27.4" cy="32" r="5.8" fill="currentColor"/>',
      "</svg>",
      "</span>",
    ].join("");
  }

  function iconCheck() {
    return [
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">',
      '<path d="M20 6 9 17l-5-5"/>',
      "</svg>",
    ].join("");
  }

  function iconClose() {
    return [
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">',
      '<path d="M18 6 6 18"/>',
      '<path d="m6 6 12 12"/>',
      "</svg>",
    ].join("");
  }

  function iconMessage() {
    return [
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
      "</svg>",
    ].join("");
  }

  function openOverlay(root) {
    var overlay = root.querySelector(".guestly-embed-overlay");
    if (!overlay) return;
    overlay.setAttribute("data-open", "true");
    document.documentElement.style.overflow = "hidden";
    var textarea = overlay.querySelector("textarea");
    window.setTimeout(function () {
      textarea && textarea.focus();
    }, 80);
  }

  function closeOverlay(root) {
    var overlay = root.querySelector(".guestly-embed-overlay");
    if (!overlay) return;
    overlay.removeAttribute("data-open");
    document.documentElement.style.overflow = "";
  }

  function buildTrigger(root, config) {
    var trigger = createElement("button", "guestly-embed-trigger");
    trigger.type = "button";
    trigger.innerHTML = markSvg() + "<span>" + escapeHtml(config.triggerText) + "</span>";
    trigger.addEventListener("click", function () {
      if (config.mode === "link") {
        window.location.href = buildPublicUrl(config);
        return;
      }
      openOverlay(root);
    });
    return trigger;
  }

  function buildPublicUrl(config) {
    return config.appUrl.replace(/\/$/, "") + "/f/" + encodeURIComponent(config.slug);
  }

  function buildOverlay(root, config) {
    var overlay = createElement("div", "guestly-embed-overlay");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Guestly feedback");

    var panel = createElement("div", "guestly-embed-panel");
    var header = createElement("div", "guestly-embed-header");
    var headerCopy = createElement("div");
    var eyebrow = createElement("p", "guestly-embed-eyebrow", config.organization);
    var title = createElement("h2", "guestly-embed-title", config.location);
    var subtitle = createElement("p", "guestly-embed-subtitle", "Reference " + config.reference);
    var close = createElement("button", "guestly-embed-close");
    close.type = "button";
    close.setAttribute("aria-label", "Close feedback form");
    close.innerHTML = iconClose();
    close.addEventListener("click", function () {
      closeOverlay(root);
    });

    headerCopy.appendChild(eyebrow);
    headerCopy.appendChild(title);
    headerCopy.appendChild(subtitle);
    header.appendChild(headerCopy);
    header.appendChild(close);

    var form = buildForm(root, config);
    var success = buildSuccess(config);
    var footer = createElement("div", "guestly-embed-footer");
    footer.innerHTML = markSvg() + "<span>Feedback routes into Guestly intelligence workflows.</span>";

    panel.appendChild(header);
    panel.appendChild(form);
    panel.appendChild(success);
    panel.appendChild(footer);
    overlay.appendChild(panel);
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) closeOverlay(root);
    });

    return overlay;
  }

  function buildForm(root, config) {
    var form = createElement("form", "guestly-embed-form");
    form.setAttribute("data-form", "true");
    form.appendChild(field("Rating (optional)", buildRating()));
    form.appendChild(field("What should the team know?", textarea("Share a quick note about your experience.", true)));
    form.appendChild(field("Name (optional)", input("text", "Your name", false)));
    form.appendChild(field("Email (optional)", input("email", "you@example.com", false)));

    var submit = createElement("button", "guestly-embed-submit");
    submit.type = "submit";
    submit.innerHTML = iconMessage() + "<span>Submit feedback</span>";
    form.appendChild(submit);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var message = form.querySelector("textarea").value.trim();
      if (!message) return;
      var payload = {
        rating: state.activeRating,
        message: message,
        name: form.querySelector('input[type="text"]').value.trim(),
        email: form.querySelector('input[type="email"]').value.trim(),
        source: config.location,
        reference: config.reference,
        createdAt: new Date().toISOString(),
      };
      persistSignal(payload);
      form.style.display = "none";
      root.querySelector(".guestly-embed-success").setAttribute("data-visible", "true");
      window.setTimeout(function () {
        closeOverlay(root);
      }, 2600);
    });

    return form;
  }

  function buildSuccess(config) {
    var success = createElement("div", "guestly-embed-success");
    success.innerHTML = [
      '<span class="guestly-embed-success-icon">',
      iconCheck(),
      "</span>",
      "<h3>Thank you for telling us.</h3>",
      "<p>Your feedback has been routed to " + escapeHtml(config.organization) + " for operational review.</p>",
    ].join("");
    return success;
  }

  function field(label, control) {
    var wrapper = createElement("label");
    var span = createElement("span", "guestly-embed-label", label);
    wrapper.appendChild(span);
    wrapper.appendChild(control);
    return wrapper;
  }

  function input(type, placeholder, required) {
    var element = createElement("input", "guestly-embed-input");
    element.type = type;
    element.placeholder = placeholder;
    element.required = required;
    return element;
  }

  function textarea(placeholder, required) {
    var element = createElement("textarea", "guestly-embed-textarea");
    element.placeholder = placeholder;
    element.required = required;
    return element;
  }

  function buildRating() {
    var wrapper = createElement("div", "guestly-embed-rating");
    [1, 2, 3, 4, 5].forEach(function (value) {
      var button = createElement("button", "", String(value));
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", function () {
        state.activeRating = value;
        Array.prototype.forEach.call(wrapper.querySelectorAll("button"), function (candidate) {
          candidate.setAttribute("aria-pressed", candidate === button ? "true" : "false");
        });
      });
      wrapper.appendChild(button);
    });
    return wrapper;
  }

  function persistSignal(payload) {
    try {
      var key = "guestly.embed.signals.v1";
      var existing = JSON.parse(window.localStorage.getItem(key) || "[]");
      existing.unshift(payload);
      window.localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent("guestly:feedback", {
          detail: payload,
        })
      );
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initNode(node) {
    if (node.getAttribute("data-guestly-ready") === "true") return;
    node.setAttribute("data-guestly-ready", "true");
    node.classList.add("guestly-embed-root");
    var config = mergeConfig(node);
    node.appendChild(buildTrigger(node, config));
    node.appendChild(buildOverlay(node, config));
    state.instances.push({ node: node, config: config });
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-guestly-widget]"), initNode);
  }

  window.GuestlyWidget = {
    init: init,
    instances: state.instances,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

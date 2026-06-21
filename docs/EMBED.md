# Guestly Website Embed

Guestly can be embedded into the public website as a branded feedback intake widget. This is useful for the landing page, campaign pages, post-stay pages, and property microsites where the visitor should experience Guestly without being sent to a local development URL.

## Script Embed

Add the stylesheet and script to the landing page:

```html
<link rel="stylesheet" href="https://www.getguestly.com/embed/guestly-widget.css" />
<script defer src="https://www.getguestly.com/embed/guestly-widget.js"></script>
```

Then place a widget mount point where the feedback action should appear:

```html
<div
  data-guestly-widget
  data-app-url="https://www.getguestly.com"
  data-organization="The Meridian House"
  data-location="Lobby QR"
  data-reference="LOBBY"
  data-slug="meridian-lobby"
  data-trigger-text="Share feedback"
></div>
```

The widget opens a polished Guestly intake modal that matches the product UI: cold white surfaces, black primary actions, sharp typography, and operational routing language.

## Link Mode

Use link mode when the page should send guests directly to a hosted feedback route:

```html
<div
  data-guestly-widget
  data-mode="link"
  data-app-url="https://www.getguestly.com"
  data-slug="meridian-table-18"
  data-trigger-text="Open Guestly feedback"
></div>
```

## Production Deployment

For production, deploy the Guestly product app to a public domain or subdomain, then point the landing page embed at that domain:

- Same domain: `https://www.getguestly.com/f/meridian-lobby`
- Product subdomain: `https://app.getguestly.com/f/meridian-lobby`
- Property campaign page: embed the modal and route submissions into Guestly signal workflows

During development, use the local product server for previewing the widget. Production pages should use the deployed Guestly app URL in `data-app-url`.

## Event Hook

If local storage is unavailable, the widget emits a browser event that the landing page can capture:

```js
window.addEventListener("guestly:feedback", function (event) {
  console.log("Guestly feedback payload", event.detail);
});
```

This keeps the embed flexible for static hosting, custom analytics, and later server-side intake routing.

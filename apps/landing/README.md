# Guestly Landing

Public marketing landing page for Guestly.

## Configuration

Set these environment variables in the landing Vercel project:

```bash
VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_access_key
VITE_GUESTLY_APP_URL=https://app.getguestly.com
VITE_GUESTLY_ADMIN_CODES=your-operator-code,your-secondary-code
VITE_DEMO_REQUEST_EMAIL=hello@getguestly.com
```

The request access form submits through Web3Forms when `VITE_WEB3FORMS_ACCESS_KEY` is available. If the key is missing, it opens a prepared email draft for the configured request inbox.

The `/admin` page is a branded operator handoff into the product app. Use production authentication inside the product workspace for protected data.

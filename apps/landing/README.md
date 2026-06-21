# Guestly Landing

Public marketing landing page for Guestly.

## Configuration

Optional local configuration:

```bash
VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_access_key
VITE_GUESTLY_APP_URL=https://app.getguestly.com
VITE_DEMO_REQUEST_EMAIL=hello@getguestly.com
```

The request access form submits through Web3Forms when `VITE_WEB3FORMS_ACCESS_KEY` is available. If the key is missing, it opens a prepared email draft for the configured request inbox.

Demo and sign-in CTAs route to the product login at `app.getguestly.com/login`. Use authentication inside the product workspace for protected data.

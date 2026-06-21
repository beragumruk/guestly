# Guestly Landing Page

Public marketing landing page for Guestly.

## Request Demo Flow

The request access form submits through Web3Forms when a `VITE_WEB3FORMS_ACCESS_KEY` environment variable is available. If the key is missing, it falls back to opening a prepared email draft with the visitor's details.

Web3Forms does not require Resend, sending-domain DNS, or a backend API route for the current landing page.

Add this environment variable in Vercel:

```bash
VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_access_key
```

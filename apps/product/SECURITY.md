# Security

Guestly does not commit secrets, service-role keys, payment credentials, or webhook signing secrets.

Use environment variables for deployment configuration. `.env.example` documents the expected names without values.

## Reporting

Report security concerns privately to the Guestly maintainers. Do not open public issues for suspected vulnerabilities.

## Data Handling

Guest feedback can include personally identifiable information. Production deployments should enforce least-privilege access, encrypted transport, authenticated manager sessions, database row-level access controls, and operational audit logging.

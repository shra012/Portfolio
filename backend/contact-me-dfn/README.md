# Contact Me - Digital Ocean Function

This is a serverless function deployed on Digital Ocean Functions that handles contact form submissions from the portfolio website

## Overview

This function receives contact form data via HTTP POST requests and processes them securely. It's designed to handle contact form submissions from the frontend portfolio application.

## Function Details

- **Runtime**: Node.js
- **Platform**: Digital Ocean Functions

## CI/CD Pipeline

This function uses GitHub Actions for automated deployment:

### Workflow

**Deploy Workflow** (`.github/workflows/deploy-do-function.yml`)
- Automatically deploys to Digital Ocean Functions
- Tests the deployed function
- Comments on PRs with deployment status
- Runs on pushes to `development`, `main`, or `master` branches

### Required Secrets

Add these secrets to your GitHub repository settings:

1. **`DIGITALOCEAN_ACCESS_TOKEN`**
   - Your Digital Ocean API token
   - Get from: Digital Ocean Console → API → Tokens/Keys
   - Requires Functions scope permissions

2. **`DO_FUNCTION_AUTH_TOKEN`**
   - Base64 encoded auth token for function testing
   - Same token used in frontend environment variables

### Setup Instructions

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add the required secrets mentioned above
3. Push changes to `backend/contact-me-dfn/` to trigger the workflow

## Request Format

The function expects a POST request with the following JSON payload:

```json
{
  "name": "User Name",
  "email": "user@example.com", 
  "message": "User's message content"
}
```

## Authentication

The function requires Basic Authentication:
- **Header**: `Authorization: BASIC <base64-encoded-credentials>`
- The credentials are base64 encoded username:password format

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "message": "Error description"
}
```

## Usage from Frontend

The function is called from the portfolio frontend Contact and Feedback forms:

```javascript
const response = await fetch(FUNCTION_URL, {
  method: 'POST',
  headers: {
    'Authorization': `BASIC ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: formData.name,
    email: formData.email,
    message: formData.message,
  }),
});
```

## Security

- **Authentication**: Basic Auth required for all requests
- **CORS**: Configured to allow requests from the portfolio domain
- **Input Validation**: Server-side validation of required fields
- **Environment Variables**: Sensitive credentials stored as environment variables

## Environment Variables

The function uses the following environment variables:
- Email service configuration
- SMTP credentials

## Files Structure

```
backend/contact-me-dfn/
├── index.js          # Main function code
├── package.json      # Dependencies and metadata
├── project.yml       # Digital Ocean function configuration
├── README.md         # This documentation
└── packages/         # Generated during deployment (not committed)
    └── contact-me/
        └── contact-me-dfn/
```

## Deployment

### Automatic Deployment (Recommended)
- Push changes to `main`/`master` branch
- GitHub Actions will automatically deploy
- Check the Actions tab for deployment status

### Manual Deployment
This function is deployed using Digital Ocean Functions platform. The deployment configuration is defined in `project.yml`.

```bash
# Install Digital Ocean CLI
npm install -g @digitalocean/functions-cli

# Login to Digital Ocean
doctl serverless connect

# Deploy function
doctl serverless deploy . --verbose
```

## Local Development

To test locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env` file

3. Run locally using Digital Ocean CLI or test framework

## Monitoring

- Check function logs in Digital Ocean dashboard
- Monitor GitHub Actions workflow runs
- Monitor response times and error rates
- Set up alerts for function failures

## Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check GitHub secrets are properly set
   - Verify Digital Ocean token permissions
   - Check workflow logs for specific errors

2. **Function Returns 500 Error**
   - Check Digital Ocean function logs
   - Verify environment variables are set
   - Test function manually via doctl

3. **Authentication Errors**
   - Verify auth token is base64 encoded
   - Check token hasn't expired
   - Ensure proper Authorization header format

### Testing the Function

You can test the function manually using curl:

```bash
curl -X POST "https://your-function-url" \
  -H "Authorization: BASIC your-base64-token" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

## Support

For issues or questions related to this function, please check the main portfolio repository or contact the maintainer.

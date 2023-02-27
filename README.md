# IBDP-CS-IA-product

## Dependencies
### Docker
For the product to be run, a suitable version of `docker` and `docker-compose` would be required. The following links can be used:
<br/>
https://docs.docker.com/get-docker/
<br/>
https://docs.docker.com/compose/install/
<br/>

### Google OAuth2 Client
The product used emails to send OTP to users. To do so, the `.env` file in the base directory contains the following 4 environment variables: `emailAddress`, `emailClientId`, `emailClientSecret`, and `emailRefreshToken`. However, in the `.env` file provided, these variables will be left blank for security reasons. A Google OAuth2 client would be needed for the product to be functional, with permission to access a Gmail account. The following website can be used as a guide:
<br/>
https://developers.google.com/identity/protocols/oauth2


### How to deploy the product
Run the following commands in the product directory to deploy the product:
```
docker compose build 
docker compose up -d
```
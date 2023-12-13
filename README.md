# Transcendence
For the official subject of the project:

> This project is about creating a website for the mighty Pong contest!
>
> Thanks to your website, users will play Pong with others. You will provide a nice user interface, a chat, and real-time multiplayer online games!
<img src="https://github.com/iker-gonzalez/ft_transcendence/assets/73175085/99bc32d4-35d5-4854-a593-a66f06c682df" width="100%" />


## Features
- Backend in NestJS
  - PostgreSQL with Prisma
  - E2E testing with Pactum
- Frontend in TypeScript React  
- Dockerized
- Features:
  - User
    - 2FA authentication with authenticator app
    - Login through 42 Intra OAuth system
    - List of friends with live status
    - Stats, e.g. wins and losses, match history, etc.
  - Game
    - Online multiplayer Pong-like
    - Matchmaking system
    - Canvas game in JavaScript
    - Game customization, e.g. themes and power-ups
  - Chat
    - Private conversation with Blocking feature
    - Channels (public, private, password-protected)
    - Ownr and Admin rights (e.g. muting, kicking, banning members)
    - Game invitation through chat

# Application Environment Configuration
This application relies on environment variables to customize its behavior. To set up your development environment, follow these steps:

Create a .env file at the root of the project.
Open the .env file in a text editor of your choice.
You'll need to provide values for various environment variables based on your specific configuration. Refer to the Docker Compose file and service configurations for a list of required environment variables.

Note: Sensitive information such as database credentials should be handled securely. Ensure that you do not expose these values in public repositories or environments.



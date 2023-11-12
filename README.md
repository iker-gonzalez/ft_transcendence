# Transcendence
For the official subject of the project:

> This project is about creating a website for the mighty Pong contest!
>
> Thanks to your website, users will play Pong with others. You will provide a nice user interface, a chat, and real-time multiplayer online games!
<img src="https://github.com/iker-gonzalez/ft_trascendence/assets/73175085/d02ab5a4-4ada-4c34-8b6d-3e02d9836fb1" width="600" />


## Features
- Backend written in NestJS
  - PostgreSQL with Prisma
- Frontend (SPA) written with React (TypeScript)
- Completely containerized with Docker
- User account
  - Two-factor authentication
  - Login through 42 Intranet OAuth system
  - List of friends with live status
  - Stats, e.g. wins and losses, ladder level, achievements, etc.
  - Public match History
- Chat
  - Chat rooms (public and password-protected
  - Function to block users
  - Channel owner and administrator
  - User ban function
  - Game invite through chat
- Game
  - Online multiplayer Pong
  - Matchmaking system
  - Canvas game in pure JavaScript
  - Game customization, e.g. power-ups, maps, etc
  - Mobile devices support

## Subject compliance
### Overview
- [x] Your website backend must be written in NestJS.
- [x] The frontend must be written with a TypeScript framework of your choice.
- [ ] You are free to use any library you want to in this context. However, you must use the latest stable version of every library or framework used in your project. -> TO CHECK BEFORE SUBMISSION
- [x] You must use a PostgreSQL database. That’s it, no other database.
- [X] Your website must be a single-page application. The user should be able to use the Back and Forward buttons of the browser.
- [x] Your website must be compatible with the latest stable up-to-date version of Google Chrome and one additional web browser of your choice.
- [ ] The user should encounter no unhandled errors and no warnings when browsing the website. -> TO CHECK BEFORE SUBMISSION
- [x] Everything has to be launch by a single call to: `docker-compose up --build`
### Security concerns
- [ ] Any password stored in your database must be hashed. --> CHECK CHAT PASSWORD
- [x] Your website must be protected against SQL injections.
- [x] You must implement some kind of server-side validation for forms and any user input.
- [x] Please make sure you use a strong password hashing algorithm
- [x] For obvious security reasons, any credentials, API keys, env variables etc...  must be saved locally in a .env file and ignored by git.  Publicly stored credentials will lead you directly to a failure of the project.
### User account
- [x] The user must login using the OAuth system of 42 intranet.
- [x] The user should be able to choose a unique name that will be displayed on the website.
- [x] The user should be able to upload an avatar. If the user doesn’t upload an avatar, a default one must be set.
- [x] The user should be able to enable two-factor authentication. For instance, Google Authenticator or sending a text message to their phone.
- [x] The user should be able to add other users as friends and see their current status (online, offline, in a game, and so forth).
- [x] Stats (such as: wins and losses, ladder level, achievements, and so forth) have to be displayed on the user profile.
- [x] Each user should have a Match History including 1v1 games, ladder, and any- thing else useful. Anyone who is logged in should be able to consult it.
### Chat
- [ ] The user should be able to create channels (chat rooms) that can be either public, or private, or protected by a password.
- [ ] The user should be able to send direct messages to other users.
- [ ] The user should be able to block other users. This way, they will see no more
messages from the account they blocked.
- [ ] The user who has created a new channel is automatically set as the channel owner until they leave it.
  - [ ] The channel owner can set a password required to access the channel, change it, and also remove it.
  - [ ] The channel owner is a channel administrator. They can set other users as administrators.
  - [ ] A user who is an administrator of a channel can kick, ban or mute (for a limited time) other users, but not the channel owners.
- [ ] The user should be able to invite other users to play a Pong game through the chat interface.
- [ ] The user should be able to access other players profiles through the chat interface.
### Game
- [x] Therefore, users should be able to play a live Pong game versus another player directly on the website.
- [x] There must be a matchmaking system: the user can join a queue until they get automatically matched with someone else.
- [x] It can be a canvas game, or it can be a game rendered in 3D, it can also be ugly, but in any case, it must be faithful to the original Pong (1972).
- [ ] You must offer some customization options (for example, power-ups or different maps). However, the user should be able to select a default version of the game without any extra features if they want to.
- [ ] The game must be responsive!
- [ ] Think about network issues, like unexpected disconnection or lag. You have to offer the best user experience possible. -> TO CHECK BEFORE SUBMISSION




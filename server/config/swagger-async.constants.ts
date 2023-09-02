export const swaggerAsyncConstants = {
  matchmaking: {
    slug: 'matchmaking',
    description:
      'Users hit this endpoint to be added to the matchmaking queue. As soon as 2 users are in the queue, they are matched together and a game session is created.',
    endpoints: {
      newUser: {
        channel: 'matchmaking:newUser',
        description: 'Users send this message to join the matchmaking queue',
      },
      newUserIntraId: {
        channel: 'matchmaking:newUser/{intraId}',
        description:
          "Users receive this message when they are matched to a game session. In case the intraId is not valid, the user doesn't exist or there was an error creating the session, an error payload is returned by the socket.",
      },
    },
  },
  gameData: {
    slug: 'game-data',
    description:
      'Users hit this endpoint when they are playing a game. Game data is sent to to server to be shared among the two players.',
    endpoints: {
      startGame: {
        channel: 'game-data:startGame',
        description:
          'user1 sends this message to the server to initialize the game session.',
      },
      gameDataCreatedSessionId: {
        channel: 'game-data:gameDataCreated/{sessionId}',
        description:
          'Users receive this message when the game data has been created for their game session',
      },
      ready: {
        channel: 'game-data:ready',
        description:
          'Users send this message to the server when they are ready to start playing',
      },
      allOpponentsReadySessionId: {
        channel: 'game-data:allOpponentsReady/{sessionId}',
        description:
          'Users receive this message when both players are ready to start playing',
      },
    },
  },
  dtos: {
    newQueuedUser: {
      intraId: {
        description: 'The Inta ID of the user to be added to the queue',
        example: 18103,
      },
    },
    newQueuedUserResponse: {
      success: {
        description:
          'Whether the user was successfully added to a game session',
        example: true,
      },
      data: {
        description: 'Data of the game session the user was added to',
        example: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          createdAt: '2021-01-01T00:00:00.000Z',
          players: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              intraId: 667,
              username: 'jdoe',
              avatar: 'https://cdn.intra.42.fr/users/jdoe.jpg',
              email: 'john.doe@42urduliz.com',
              userGameSessionId: '550e8400-e29b-41d4-a716-446655440000',
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              intraId: 668,
              username: 'jdoe2',
              avatar: 'https://cdn.intra.42.fr/users/jdoe2.jpg',
              email: 'john.doe2@42urduliz.com',
              userGameSessionId: '550e8400-e29b-41d4-a716-446655440000',
            },
          ],
        },
      },
    },
    startGameDto: {
      gameDataId: {
        description: 'The ID of the game session including the two players',
        example: '1111',
      },
      ball: {
        description: 'The initial data of the ball',
        example: {
          x: -179.93585185334203,
          y: 182.38455876725595,
          radius: 10,
          velocityX: -7.382011345379114,
          velocityY: 6.893178403080399,
          speed: 10.2,
          color: 'WHITE',
          reset: true,
          top: 172.38455876725595,
          bottom: 192.38455876725595,
          left: -189.93585185334203,
          right: -169.93585185334203,
        },
      },
      user1: {
        description: 'The initial data of the first player',
        example: {
          x: 30,
          y: 250,
          width: 10,
          height: 96,
          score: 2,
          color: 'WHITE',
          top: 250,
          bottom: 346,
          left: 30,
          right: 40,
        },
      },
      user2: {
        description: 'The initial data of the second player',
        example: {
          x: 860,
          y: 357.7496151396943,
          width: 10,
          height: 100,
          score: 1,
          color: 'WHITE',
          top: 357.7496151396943,
          bottom: 457.7496151396943,
          left: 860,
          right: 870,
        },
      },
    },
    readyPlayerDto: {
      isUser1: {
        description:
          'Whether the player is the first player (true) or the second player (false)',
        example: true,
      },
    },
  },
};

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
  },
};

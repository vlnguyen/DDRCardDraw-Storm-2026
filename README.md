# DDR Tools (Storm 2026)

This is a fork of [ddr.tools](https://ddr.tools) used locally for ITG Singles at Project Storm 2026.

# Dependencies

## syncstart
[vlnguyen/syncstart](https://github.com/vlnguyen/syncstart) - a fork of GrooveStats syncstart service which is required for match logging. Clone the repository, `npm install` to install dependencies, then `npm run start:dev` to host the server locally.

## Simply Love v5.9.0
[vlnguyen/Simply-Love-SM5](github.com/vlnguyen/Simply-Love-SM5) - a fork of Simply Love v5.9.0 which adds a module to enforce the usage of online lobbies. Edit `SL-OnlineHelpers.lua` and change `local host` to point to your syncstart instance.

# Installation

- Install dependencies with `yarn install`
- Start partykit with `yarn start:backend`
- Create a `.env` file and add keys `SYNCSTART_URL` and `SYNCSTART_PORT` to point to your syncstart service (example in `.env.template`)
- Launch app with `yarn start:frontend`

# Usage 

Most OBS sources are exposed through the UI with "Copy link to clipboard" buttons throughout the stream dashboard. A few assets are not linked on the app yet at the time of writing.
- `/e/:roomName/persona-3-circle` - displays a circle asset with a text rotating around the perimeter. This is implemented as `persona-3-circle.tsx` and is customizable, this source expects a 4K viewport.
- `/e/:roomName/triangles` - an animated background inspired by Persona, this also expects a 4K viewport.


## Deployment

Running `yarn build` will create a distribution of the application with static content that can be used in a production environment in a multitude of ways. The following are options for deployment

### Local

Running `yarn build:zip` produces a zip file that can be extracted anywhere on your PC. Simply open the included `index.html` to start using DDRCardDraw. That's it!

### Docker/Containers

For more advanced users, a Dockerfile has been included to produce a docker image that can be deployed in any container environment, whether it is using the docker engine directly or using an orchestration tool like docker-compose or kubernetes.

```sh
docker build -t ddrcarddraw .
docker run ddrcarddraw
```

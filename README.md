# Exstasy Components (ex-components)

Set of headless UI components using Vue 3 and Typescript.

For full documentation, visit [exstasy-ui.iamsujith.in](https://exstasy-ui.iamsujith.in/)

> [!NOTE]
> I developed this for my own learning and usage inspired by Tailwind team's Headless UI. PR's and new feature suggestions are always welcome.

Install the package using npm,
```sh
npm install @sujithjr/exstasy-components
```

Or install using Bun.js,

```sh
bun add @sujithjr/exstasy-components
```

You can either import the components individually (tree shakable) or register it globally in `main.ts` or `main.js`,
```js
import ExstasyComponents from '@sujithjr/exstasy-components'

const app = createApp(App)

app.use(ExstasyComponents)
```

For contribution, clone the repo and install dependencies using,
```sh
bun install
```

Start the development server, and visit http://localhost:5173/ in the browser
```sh
bun dev
```

Build for production,
```sh
bun run build
```

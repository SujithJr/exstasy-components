# Ecstasy Components (ex-components)

Set of headless UI components using Vue 3 and Typescript.

I developed this for my own learning and usage inspired by Tailwind team's Headless UI. PR's and new feature suggestions are always welcome, but
I'll be providing updates only based on my schedule and availability.

Install the package

```bun
bun add ecstasy-components
```

You can either import the components individually (tree shakable) or register it globally in `main.ts` or `main.js`,
```js
import EcstasyComponents from 'ecstasy-components'

const app = createApp(App)

app.use(EcstasyComponents)
```

To view the playground, clone the repo and install dependencies using,
```bash
bun install
```

Start the development server, and visit http://localhost:5173/ in the browser
```bash
bun dev
```

Build for production,
```bash
bun run build
```

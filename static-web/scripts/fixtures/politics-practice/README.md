# Isolated Politics Workbench fixture

This separate Astro root mounts the production Workbench, its client, the existing first-attempt writer, the explicit public/review serializers and the exact-return bridge. Its eight questions and two source units are wholly synthetic. No Current Politics loader is imported here. Nothing is injected into the production Astro config or production routes, and no Current SHA/manifest is patched.

From `static-web/`:

```sh
npm install --no-audit --no-fund --package-lock=false
npm install --no-save --no-audit --no-fund --package-lock=false playwright@1.56.1
npx playwright install chromium
npm run test:politics-practice
```

The test builds this isolated root, serves its production output on 127.0.0.1:4339, launches fresh browser contexts at 1440×900, checks runtime and persistence failure paths, captures long and narrow-window samples, and closes its own server/browser. `PRACTICE_QA_PORT` can select another free port; `PRACTICE_QA_HEADED=1` makes the browser visible. Evidence goes to `output/playwright/issue117/`.

For an interactive isolated preview:

```sh
node_modules/.bin/astro dev --root scripts/fixtures/politics-practice --host 127.0.0.1 --port 4338
```

These are engineering SELF checks, never learner U. They cannot verify the 1148 formal bindings, formal source ownership or real corpus visual coverage. Production `qa:politics` keeps the independent Current asset gate.

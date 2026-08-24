import { compile } from 'sass';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// 将 theme 与逐组件样式编译为发布产物：
//   packages/theme/*.scss                 -> dist/theme/*.css
//   packages/components/*/style/index.scss -> dist/{es,lib}/components/*/style/index.css
//
// 原因：这些 .scss 未被组件 index.ts 自动引入（按需样式模式，样式由 resolver / 消费者单独引入），
// 因此不在 Vite 的模块图中，Vite 的 cssCodeSplit 无法触及它们，需本脚本单独编译。

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packages = join(root, 'packages');

function write(target, content) {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  console.log(`  ✓ ${target}`);
}

function compileToCss(src) {
  return compile(src).css;
}

console.log('[build-styles] compiling theme…');
for (const name of ['index', 'light', 'dark']) {
  const src = join(packages, 'theme', `${name}.scss`);
  write(join(root, 'dist', 'theme', `${name}.css`), compileToCss(src));
}

console.log('[build-styles] compiling component styles…');
const componentsDir = join(packages, 'components');
const components = readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

for (const name of components) {
  const src = join(componentsDir, name, 'style', 'index.scss');
  const css = compileToCss(src);
  write(join(root, 'dist', 'es', 'components', name, 'style', 'index.css'), css);
  write(join(root, 'dist', 'lib', 'components', name, 'style', 'index.css'), css);
}

console.log('[build-styles] done');

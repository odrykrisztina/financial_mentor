# Modern Web Frameworks

### Project structure:




```bash
modern-web-frameworks  
├─── frontend
│   ├─── angular
│   ├─── vue
│   └─── react
│   ...
│   
├─── backend
│   ├─── laravel
│   └─── express
│   ...
│ 
├─── docs
│   └─ README.md
│   ...
│
├─ .gitignore 
└─ README.md 
```

---

### In the root project folder
Make empty folders visible to git

```bash
cd modern-web-frameworks
touch backend/.gitkeep frontend/.gitkeep
```

### In the root projek folder create .gitignore file

```
# General
.DS_Store
Thumbs.db
*.log

# IDE
.vscode/
.idea/

# Node/Angular
node_modules/
dist/
build/
.vite/
.angular/
.angular/cache/

# Python
__pycache__/
.venv/
venv/

# PHP/Laravel
/vendor/
storage/
bootstrap/cache/

# Environment
.env
.env.*
!.env.example

``` 
---

## Make Angular project

```bash
cd frontend
npx @angular/cli@latest new angular --standalone --routing --style=css --skip-git
```
- SSR/SSG? → N
- Zoneless? → N
- AI tools → None

---

### First run (angular folder)

```bash
cd angular
npm start

# Local:   http://localhost:4200/
```

---

### Determinate server

```bash
Ctrl C
```

---

### Add Tailwind v4 CSS framework (angular folder)

- INSTALL
  ```bash
  # frontend/angular
  npm install tailwindcss @tailwindcss/postcss postcss --force

  ```
- CONFIGURE PostCSS Plugins<br>
  Create a .postcssrc.json file in the angular folder
  ```json
  {
    "plugins": {
      "@tailwindcss/postcss": {}
    }
  }
  ```
- IMPORT Tailwind CSS<br>
  (styles.css)
  ```css
  @import "tailwindcss";
  ```

---

### Install Flowbite (Tailwind CSS component library)
- INSTALL
  ```bash
  # frontend/angular
  npm install flowbite --save
  ```
- IMPORT Flowbite:<br>
  (styles.css)
  - default theme, 
  - plugin, 
  - source files
  ```css
  //...
  @import "flowbite/src/themes/default";
  @plugin "flowbite/plugin";
  @source "../node_modules/flowbite";
  ```
---

### Add Font Awesome icons (angular folder)
```bash
# frontend/angular
npm i @fortawesome/angular-fontawesome @fortawesome/fontawesome-svg-core \
      @fortawesome/free-solid-svg-icons @fortawesome/free-regular-svg-icons \
      @fortawesome/free-brands-svg-icons
```

### Set environment (folder: frontend/angular/src/app/)

- CREATE app.component.ts
  ```ts
  // frontend/angular/src/app/
  import { Component } from '@angular/core';
  import { RouterOutlet } from '@angular/router';
  import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
  import { faUser } from '@fortawesome/free-solid-svg-icons';

  @Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, FontAwesomeModule],
    templateUrl: './app.component.html',
  })
  export class AppComponent {
    faUser = faUser;

    toggleTheme() {
      const root = document.documentElement;
      const dark = root.classList.toggle('dark');
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    }
  }
  ```
  - CREATE app.component.html
  ```html
  <header class="sticky top-0 z-10 
               bg-white/90 backdrop-blur border-b 
               dark:bg-gray-900">
    <nav class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
      <a routerLink="/" class="font-semibold">Modern Web Frameworks</a>
      <a routerLink="/about" class="hover:underline">About</a>
      <span class="ml-auto flex items-center gap-2 
                 text-gray-600 dark:text-gray-300">
        <fa-icon [icon]="faUser" class="text-lg"></fa-icon>
        <button
          class="ml-2 rounded px-2 py-1 text-sm border 
               hover:bg-gray-50 dark:hover:bg-gray-800"
          (click)="toggleTheme()">
          🌓
        </button>
      </span>
    </nav>
  </header>

  <main class="max-w-5xl mx-auto px-4 py-6">
    <router-outlet />
  </main>

  <footer class="border-t mt-16 text-gray-500 dark:text-gray-400">
    <div class="max-w-5xl mx-auto px-4 py-6 text-sm">
      © {{ new Date().getFullYear() }} Money & More Szeged — Oktatási célra
    </div>
  </footer>

  ```
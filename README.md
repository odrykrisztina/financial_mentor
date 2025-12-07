# Financial mentor

### Require environment:
- Node.js       v22.20.0 +
- npm           11.2.0 +
- PHP           8.2.12 +
  Set to environment path 
      
- Composer      2.8.12 +
- git           2.48.1 +
- xampp / MySQL 3.3.0 +
-    

### Install (first time)
- cd frontend
- npm install
- cd ..
  
- cd backend
- composer install

- Create .env file
  - bash: cp .env.example .env
  - cmd : copy .env.example .env
  
- Modify .env:
  - APP_NAME="Financial mentor"
  
  - DB_CONNECTION=mysql
  - DB_HOST=127.0.0.1
  - DB_PORT=3306
  - DB_DATABASE=financial_mentor
  - DB_USERNAME=root
  - DB_PASSWORD=

- create Database in MySQL
  (if exist drop all tables)
  - name    : financial_mentor
  - encoding: utf8mb4_unicode_ci
  - cd ..
  
- PhpMyAdmin:
  - Open database
  - Import from app folder:
    backend/db/financial_mentor.sql

### Run (servers)
#### In root folder
Start:
- ./start.bat

Or start both separately:
- Backend
  - cd backend
  - php artisan serve
- Frontend
  - cd frontend
  - npm start
  
### MySQL
- Start XAMPP Control Panel
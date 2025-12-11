# Financial mentor

# Every User, Worker password: 1234Aa 

### Require environment:
- Node          v22.20.0 +
- npm           11.2.0 +
- typescript    5.9.3 +
- Angular CLI   20.3.13 +
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
  
- cd ..

- PhpMyAdmin:
  - create Database in MySQL
    - if exist drop all tables
    - Or create new:
      - name    : financial_mentor
      - encoding: utf8mb4_unicode_ci
  
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
# Rooftop Energy Project

Welcome to the **Rooftop Energy** project. This project provides functionality for energy system calculations and integrates with a database for storing customer and energy-related data.

## Table of Contents

- [Installation Instructions](#installation-instructions)
- [SQL Schema](#sql-schema)
- [Environment Configuration](#environment-configuration)
- [Running the Project](#running-the-project)

---

## Installation Instructions

1. **Clone the Repository**
   
   First, clone this repository to your local machine:

   ```bash
   git clone https://your-repository-url.git
   cd rooftop-energy
   ```

2. Install the required dependency
  ```bash
  npm install
  ```

3. Create the .env File at the root directory. Format as below. Replace the value according to your local database server credentials
   ```bash
    DB_HOST=
    DB_USER=
    DB_PASSWORD=
    DB_DATABASE=
    DB_PORT=
   ```

4. Setup Database
   The sql schema file is located in /public/assets/schema.

5. Run the project
   ```bash
   npm start
   ```
   

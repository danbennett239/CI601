# DentalConnect

DentalConnect is a full-stack web application that enables users to search, compare, and book private dental appointments. It uses React, Next.js, Hasura, PostgreSQL, and is designed for local development using Docker.

## Prerequisites

Before starting, make sure the following tools are installed on your machine:

| Tool           | Required | Description                                        | Download Link                                                   |
|----------------|----------|----------------------------------------------------|------------------------------------------------------------------|
| **Docker**     | ✅ Yes    | Runs PostgreSQL and Hasura containers              | [Get Docker](https://www.docker.com/products/docker-desktop)     |
| **Node.js**    | ✅ Yes    | Runs the frontend app (Next.js)                    | [Get Node.js](https://nodejs.org/)                               |
| **Hasura CLI** | ✅ Yes  | Applies Hasura migrations and metadata       | [Install Hasura CLI](https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/) |


## 1. Clone the Repository

```bash
git clone https://github.com/danbennett239/CI601.git
cd ci601-app
```

## 2. Create .env file

Create a .env file in the root of the project and populate the fields defined within .env.example

## 3. Start Hasura and Postgres with Docker

```bash
docker-compose up -d
```

## 4. Populate Hasura
```
cd hasura
hasura migrate apply
hasura metadata apply
```

## 5. Install dependencies
```
npm install
```

## Running the local development environment

Run Docker
```
docker-compose up
```

Run Hasura
```
cd hasura
hasura console
```
Run Frontend 
```
npm run dev
```

## Running Tests
Start Local development Environment
```
npx cypress open
```

Ensure the following setting in `cypress.config.ts`
```
baseUrl: "http://localhost:3000"
```
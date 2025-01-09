# school-management

# Account Manager

An account manager appplication that provides API endpoints creating account, funding, withdrawing, and transfering account funds

---

## Getting Started

To get a copy of this project up and running on your local machine for testing and development, you would need to have a minimum of the listed prerequisites installed on your local machine.

## Prerequisites

1. Node.js (v8.12.0 or higher) and npm (6.4.1 or higher) installed on your local machine. Run node -v and npm -v in your terminal to confirm that you have them installed

2. GIT and Bash

### Node
- #### Node installation on Windows

Go to [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might might be dependent on it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, by running the following command.

      $ sudo apt install nodejs
      $ sudo apt install npm

If the installation was successful, you should be able to run the following command.

    $ node --version
    v20.11.0

    $ npm --version
    6.9.0

To update your `npm`, run the following command.

    $ npm install npm -g

---

## Project Install

    $ git clone https://github.com/femigabs/school-management.git
    $ cd school-management
    $ npm install

## Configure app

Create a `.env` file and add the environment variables described in the `.env.example` file.



## Running the project

    $ npm run dev (development)

## Running migrations

    $ npm run migrate:up
    $ npm run migrate:down

## Running tests

    $ npm run test

## Technologies

- NodeJS
- Express
- MongoDb
- Supertest and mocha
- Postman

## API Documentation
- postman: https://documenter.getpostman.com/

## Copyright

Copyright (c) 2021 Femi Babayemi

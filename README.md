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

## Test Coverage
![alt text](<Screenshot 2025-01-10 at 00.03.12.png>)

## Technologies

- NodeJS
- Express
- MongoDb
- Supertest and mocha
- Postman

## API Documentation
- postman: 

## API Flow
- Creating Users:
To create additional users, you must provide a superadmin token for authorization. A default superadmin user has already been seeded in the system to initiate this process.

SuperAdmin Login Credentials
```
{
    "email": "superadmin1@gmail.com",
    "password": "Qgubinl_653nop"
}
```


## Database Schema Documentation

This section describes the database models for the application. Each schema is defined using Mongoose, with relationships and field-level constraints.

---

## User Schema

The `User` schema represents the users in the system, which can be either `superadmin` or `admin`.

| Field              | Type                | Description                                    | Constraints                       |
|--------------------|---------------------|------------------------------------------------|-----------------------------------|
| `name`             | `String`           | Full name of the user                         | Required                         |
| `email`            | `String`           | User's email address                          | Required, Unique                 |
| `password`         | `String`           | User's hashed password                        | Required                         |
| `temporaryPassword`| `Boolean`          | Indicates if the password is temporary        | Default: `true`                  |
| `role`             | `String`           | Role of the user (`superadmin`, `admin`)      | Required, Enum                   |
| `school`           | `ObjectId`         | Reference to the associated `School`          | Optional                         |
| `createdAt`        | `Date`             | Record creation timestamp                     | Default: Current Date            |
| `updatedAt`        | `Date`             | Last update timestamp                         | Default: Current Date            |
| `deletedAt`        | `Date`             | Soft delete timestamp                         | Default: `null`                  |

**Relationships**:
- Each `User` may be associated with one `School`.

---

## School Schema

The `School` schema represents the educational institutions managed by the system.

| Field            | Type                | Description                                    | Constraints                       |
|------------------|---------------------|------------------------------------------------|-----------------------------------|
| `name`           | `String`           | Name of the school                            | Required                         |
| `address`        | `String`           | Address of the school                         | Required                         |
| `email`          | `String`           | Contact email address                         | Required                         |
| `phone`          | `String`           | Contact phone number                          | Required                         |
| `admins`         | `[ObjectId]`       | Array of references to `User` (admin users)   | Optional                         |
| `classrooms`     | `[ObjectId]`       | Array of references to `Classroom`            | Optional                         |
| `students`       | `[ObjectId]`       | Array of references to `Student`              | Optional                         |
| `createdAt`      | `Date`             | Record creation timestamp                     | Default: Current Date            |
| `updatedAt`      | `Date`             | Last update timestamp                         | Default: Current Date            |
| `deletedAt`      | `Date`             | Soft delete timestamp                         | Default: `null`                  |

**Relationships**:
- Each `School` can have multiple `Classrooms` and `Students`.
- Each `School` can have multiple `admins` (users with the `admin` role).

---

## Classroom Schema

The `Classroom` schema represents a class within a school.

| Field            | Type                | Description                                    | Constraints                       |
|------------------|---------------------|------------------------------------------------|-----------------------------------|
| `schoolId`       | `ObjectId`         | Reference to the associated `School`          | Required                         |
| `name`           | `String`           | Name of the classroom                         | Required                         |
| `capacity`       | `Number`           | Maximum number of students                    | Required                         |
| `resources`      | `Array`            | List of resources (e.g., books, computers)    | Embedded Schema: `ResourceSchema`|
| `students`       | `[ObjectId]`       | Array of references to `Student`              | Optional                         |
| `createdAt`      | `Date`             | Record creation timestamp                     | Default: Current Date            |
| `updatedAt`      | `Date`             | Last update timestamp                         | Default: Current Date            |
| `deletedAt`      | `Date`             | Soft delete timestamp                         | Default: `null`                  |

**Resource Schema** (Embedded):

| Field            | Type                | Description                                    | Constraints                       |
|------------------|---------------------|------------------------------------------------|-----------------------------------|
| `type`           | `String`           | Type of resource (e.g., "Book", "Computer")    | Required                         |
| `name`           | `String`           | Name of the resource                          | Required                         |
| `quantity`       | `Number`           | Quantity of the resource                      | Required, Min: `0`               |

**Relationships**:
- Each `Classroom` belongs to one `School`.
- Each `Classroom` can have multiple `Students`.

---

## Student Schema

The `Student` schema represents students enrolled in classrooms.

| Field            | Type                | Description                                    | Constraints                       |
|------------------|---------------------|------------------------------------------------|-----------------------------------|
| `name`           | `String`           | Full name of the student                      | Required                         |
| `contactEmail`   | `String`           | Student's contact email                       | Required                         |
| `contactPhone`   | `String`           | Student's contact phone                       | Required                         |
| `dateOfBirth`    | `String`           | Student's date of birth                       | Required                         |
| `gender`         | `String`           | Gender of the student                         | Required                         |
| `classroomId`    | `ObjectId`         | Reference to the associated `Classroom`       | Required                         |
| `createdAt`      | `Date`             | Record creation timestamp                     | Default: Current Date            |
| `updatedAt`      | `Date`             | Last update timestamp                         | Default: Current Date            |
| `deletedAt`      | `Date`             | Soft delete timestamp                         | Default: `null`                  |

**Relationships**:
- Each `Student` belongs to one `Classroom`.

---


## Copyright

Copyright (c) 2025 Femi Babayemi

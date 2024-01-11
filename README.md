# Moneyhub Tech Test - Investments and Holdings

At Moneyhub we use microservices to partition and separate the concerns of the codebase. In this exercise we have given you an example `admin` service and some accompanying services to work with. In this case the admin service backs a front end admin tool allowing non-technical staff to interact with data.

A request for a new admin feature has been received

## Requirements

- As an admin, I want to be able to generate a CSV report showing the values of all user investment holdings
    - Any new routes should be added to the **admin** service
    - The csv report should be sent to the `/export` route of the **investments** service
    - The investments `/export` route expects the following:
        - content-type as `application/json`
        - JSON object containing the report as csv string, i.e, `{csv: '|User|First Name|...'}`
    - The csv should contain a row for each holding matching the following header
    |User|First Name|Last Name|Date|Holding|Value|
    - The **Holding** property should be the name of the holding account given by the **financial-companies** service
    - The **Value** property can be calculated by `investmentTotal * investmentPercentage`
    - The new route in the admin service handling the generation of the csv report should return the csv as text with content type `text/csv`
- Ensure use of up to date packages and libraries (the service is known to use deprecated packages but there is no expectation to replace them)
- Make effective use of git

We prefer:
- Functional code
- Ramda.js (this is not a requirement but feel free to investigate)
- Unit testing

### Notes
All of you work should take place inside the `admin` microservice

For the purposes of this task we would assume there are sufficient security middleware, permissions access and PII safe protocols, you do not need to add additional security measures as part of this exercise.

You are free to use any packages that would help with this task

We're interested in how you break down the work and build your solution in a clean, reusable and testable manner rather than seeing a perfect example, try to only spend around *1-2 hours* working on it

## Deliverables
**Please make sure to update the readme with**:

- Your new routes
- How to run any additional scripts or tests you may have added
- Relating to the task please add answers to the following questions;
    1. How might you make this service more secure?
    2. How would you make this solution scale to millions of records?
    3. What else would you have liked to improve given more time?


On completion email a link to your repository to your contact at Moneyhub and ensure it is publicly accessible.

## Getting Started

Please clone this service and push it to your own github (or other) public repository

To develop against all the services each one will need to be started in each service run

```bash
npm start
or
npm run develop
```

The develop command will run nodemon allowing you to make changes without restarting

The services will try to use ports 8081, 8082 and 8083

Use Postman or any API tool of you choice to trigger your endpoints (this is how we will test your new route).

### Existing routes
We have provided a series of routes

Investments - localhost:8081
- `/investments` get all investments
- `/investments/:id` get an investment record by id
- `/investments/export` expects a csv formatted text input as the body

Financial Companies - localhost:8082
- `/companies` get all companies details
- `/companies/:id` get company by id

Admin - localhost:8083
- `/investments/:id` get an investment record by id
- `/admin/generatecsv` generates a csv of the investments and companies combined data and send it to the investments service

## How to run the new feature

Use the makefile at the base of the project.

examples:
```
make start-investments
```
Will start the "investment service".

```
make tests-unit-with-coverage
```
Will run the unit tests.
### Answers to questions:
**1. How might you make this service more secure?**

There are several threats to APIs like:
Broken Access control, Injection Attacks, DDOS attacks, Brute force attacks, and Insecure designs, to name a few.
There are several steps to make this app more secure:
- Make it an HTTPS server: at the moment, this server doesn't support HTTPS. We need to configure an SSL certificate and enable HTTPS on our server.
- Make use of authentication and authorization: at the moment, if we deploy this to a production environment and enable the public to have access to it, anyone with the IP can make a request. Restricting it to authorized users will prevent unwanted access. Using an authentication method and access control list will help with the task.
- Input validation: there's a library called express-validator, for example, to help with this task so we can reject unmet criteria. Doing this would prevent bad actors from sending malicious or incorrect data.
- Proper use of encryption and sensitivities storage: ensure up-to-date and robust standard algorithms, protocols, and keys are in place. Encrypt all data in transit with secure protocols. Use proper password practices (strong adaptive and salted hashing functions with a work factor).
- Implement a rate limiter: this will defend it from DOS or DDOS attacks that can drain or crash our application.
- Use the most up-to-date, well-maintained libraries. Reduce overuse of libraries when they're not critically necessary.
- Fix Vulnerabilities proactively.
- Test all code, including error handling.
- Add proper logging and monitoring.
- In general, make use of OWASP guidelines.

**2. How would you make this solution scale to millions of records?**

We could either scale vertically or horizontally. That means either powering up our server running the application by levelling up CPU, RAM and Storage or, if we had limited resources and we'd maximized the first option already, we would need a horizontal approach.

First, the services providing the information would need to chunk the information so our API would query pages of information.
Our app would need a DB containing all these registries already combined as the final view for the CSV that would perform an update every x amount of time depending on how often the data is updated (and how up-to-date the CSV report needs to be).
I would pre-compute a CSV from the latest update. Instead of sending it to the service, I would upload it to an FTP service and send the link to it to the service expecting it (sending a big CSV file over the network wouldn't scale because of network constraints, and the service would either not be able to handle it or would need a rework to expect pagination, which it wouldn't be an excellent way to scale either). The report will then be updated whenever a fresh data set is acquired.

Option for millions of requests(general view):

Then, depending on how many requests are made for this report, we can start thinking of having multiple servers behind a gateway/load balancer (depending on authentication/authorization needs and budget). This system could be managed potentially by an orchestrator, depending on the use case, to scale up or scale down (adding or removing servers) depending on the traffic. Set a rate limiter to moderate traffic as well (and protect against abuse).
The DB tier might or might not need scale, but that depends on the type and amount of queries made and the DB type used.
If there's a bottleneck in the CSV process, batches and queues might be helpful to add. Queues will avoid clients waiting and request loss or because of server unavailability. Batches can be beneficial if the server and the DB can't handle the data to transform.

**3. What else would you have liked to improve given more time?**

Given more time I would:
- Dockerize the apps: 
This solves the problem of provisioning and dependency management. It's easier to track versions and libraries installed. Example:
---
Dockerfile for each service

```
FROM node:lts-alpine #with desired version
WORKDIR /app
COPY . .
RUN npm install
```
Docker-compose to start them all at once
```
version: "3.7"

services:
    financial-companies-service:
        command: npm start
        ports: ["8081:8081"]
    investments:
        command: npm start
        ports: ["8082:8082"]
    admin:
        command: npm start
        ports: ["8083:8083"]
...
```
---

- Add unit testing for error paths.
- Add metrics: add counters to see how many times the API is hit, how many times the CSV is generated (if we make use of the cache mentioned above), to see how often the data changes.
- Add a CI job with GitHub actions. It would look close to this:
---
.github/workflows directory at base of the project:
```
name: run-tests

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:

  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Set up NodeJS
      uses: actions/setup-node@v12
      with:
        node-version: '12.22.12'

    - name: Test
      working-directory: ./moneyHub_challenge/admin/src
      run: npm run test
```
---
- I would follow any conventions for NodeJs I'm missing or used by the team to follow the same code source structure.
- I would have used the library proposed (Ramda.js).
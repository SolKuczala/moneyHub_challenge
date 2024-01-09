const express = require("express")
const config = require("config")
const companies = require("./data")
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

const app = express()

app.get("/companies", (req, res) => {
  res.send(companies)
})

app.get("/companies/:id", (req, res) => {
  const {id: requestedId} = req.params
  const company = companies.find(({id}) => id === requestedId)
  res.send(company)
})

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err)
    process.exit(1)
  }
  console.log(`Server running on port ${config.port}`)
})

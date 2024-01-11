const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")
const winston = require('winston')
const dataTransformer = require('./data_transformation.js')


const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})
logger.info('Admin App Started')

const app = express()

app.use(bodyParser.json({limit: "10mb"}))

app.get("/investments/:id", (req, res) => {
  logger.info('Init investments retrieval')
  const {id} = req.params
  request.get(`${config.investmentsServiceUrl}/investments/${id}`, (e, r, investments) => {
    if (e) {
      logger.error(e)
      res.send(500)
    } else {
      res.send(investments)
      logger.info('Investments sent')
    }
  })
})

app.get("/admin/generatecsv", (req, res) => {
  logger.info('Init generating CSV')
  request.get(`${config.investmentsServiceUrl}/investments`, (e, _, investments) => {
    if (e) {
      logger.error(e)
      res.sendStatus(500)
    }else{
      logger.info('Investments retrieved')    
      const investmentsData = JSON.parse(investments)
      request.get(`${config.financialCompaniesServiceUrl}/companies`, (e, _, companies) => {
        if (e) {
          logger.error(e)
          res.sendStatus(500)
        }else{
          logger.info('Companies retrieved')
          const companiesData = JSON.parse(companies)
          const combinedData = dataTransformer.merge(investmentsData, companiesData)
          const csv = dataTransformer.toCSV(combinedData)
          logger.info('CSV generated')

          // send the csv
          const jsonData = {
            csv: csv
          }
          request.post(`${config.investmentsServiceUrl}/investments/export`, {json: jsonData}, (e, r, body) => {
            if (e) {
              logger.error(e)
              res.sendStatus(500)
            }else{
              res.sendStatus(200)
              logger.info('CSV sent')
            }
          })
        }
      })
    }
  })
})

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err)
    process.exit(1)
  }
  console.log(`Server running on port ${config.port}`)
})
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
console.log('Admin App Started')

const app = express()

app.use(bodyParser.json({limit: "10mb"}))

app.get("/investments/:id", (req, res) => {
  const {id} = req.params
  request.get(`${config.investmentsServiceUrl}/investments/${id}`, (e, r, investments) => {
    if (e) {
      console.error(e)
      res.send(500)
    } else {
      res.send(investments)
    }
  })
})


// create an endpoint to generate a CSV with the next information:
// columns: User,First Name,Last Name,Date,Holding,Value
// The **Holding** property should be the name of the holding account given by the **financial-companies** service
// The **Value** property can be calculated by `investmentTotal * investmentPercentage`
app.get("/admin/generatecsv", (req, res) => {
  request.get(`${config.investmentsServiceUrl}/investments`, (e, _, investments) => {
    if (e) {
      console.error(e)
      res.sendStatus(500)
    }else{
      const investmentsData = JSON.parse(investments)
        request.get(`${config.financialCompaniesServiceUrl}/companies`, (e, _, companies) => {
          if (e) {
            console.error(e)
            res.sendStatus(500)
          }else{
            const companiesData = JSON.parse(companies)
            const combinedData = dataTransformer.merge(investmentsData, companiesData)
            const csv = dataTransformer.toCSV(combinedData)
            
            // send the csv
            const jsonData = {
              csv: csv
            }
            request.post(`${config.investmentsServiceUrl}/investments/export`, {json: jsonData}, (e, r, body) => {
              if (e) {
                console.error(e)
                res.sendStatus(500)
              }else{
                res.sendStatus(200)
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
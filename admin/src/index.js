const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")
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

logger.info('App started')

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
  request.get(`${config.investmentsServiceUrl}/investments`, (e, r, investments) => {
    if (e) {
      console.error(e)
      res.send(500)
    } else {
      // to get the holding name, we need to make a request to the financial-companies service acording to the id 
      // of the holding account in the investments service
      // and to get the value, we need to multiply the investmentTotal by the investmentPercentage
      // I want to use the investments array to store the holding name and the value
      // i want to omit the id, this new array will only contain the properties that we need for the CSV
      

        // const csv = investments.map(({user, firstName, lastName, date, holding, value}) => `${user},${firstName},${lastName},${date},${holding},${value}`).join("\n")
        // res.send(csv)
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
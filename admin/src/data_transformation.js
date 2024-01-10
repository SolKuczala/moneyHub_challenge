const { Parser } = require("json2csv")

const merge = (investments, companies) => {
  
  const results = []
  
  const companiesMap = new Map();
  companies.forEach(company => {
    companiesMap[company.id] = company.name
  })

  investments.forEach(investment => {
    const resultTemplate = {
      "User": investment.userId,
      "First Name": investment.firstName,
      "Last Name": investment.lastName,
      "Date": investment.date,
    }
    
    investment.holdings.forEach(holding => {
      const result = {
        ...resultTemplate,
        "Holding":companiesMap[holding.id],
        "Value": holding.investmentPercentage * investment.investmentTotal
      }
      results.push(result)
    })

  })

  return results
}

const toCSV = (data) => {
  const fields = ["User", "First Name", "Last Name", "Date", "Holding", "Value"]
  const json2csvParser = new Parser({ fields, delimiter: '|' })
  const csv = json2csvParser.parse(data, { header: fields })
  return csv
}

module.exports = { merge, toCSV }
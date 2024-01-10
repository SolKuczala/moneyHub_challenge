const assert = require('assert');

const dataTransformer = require('../src/data_transformation.js')

describe('dataTransformer', function () {
  describe('merge()', function () {
    it('should merge the investments according to format', function () {
        const testCompanies = [
            {"id": "1","name": "Company1"},
            {"id": "2","name": "Company2"}
        ]

        const testInvestments = [{
            "userId": "1",
            "firstName": "UserName1",
            "lastName": "UserLastName1",
            "investmentTotal": 100,
            "date": "2019-01-01",
            "holdings": [
                {"id": "1", "investmentPercentage": 0.5},
                {"id": "2", "investmentPercentage": 0.5}
            ]
          }]

        const expectedResult = [{
            "User": "1",
            "First Name": "UserName1",
            "Last Name": "UserLastName1",
            "Date": "2019-01-01",
            "Holding": "Company1",
            "Value": 50
          },
          {
            "User": "1",
            "First Name": "UserName1",
            "Last Name": "UserLastName1",
            "Date": "2019-01-01",
            "Holding": "Company2",
            "Value": 50
          }]

        assert.equal(
            JSON.stringify(
                dataTransformer.merge(
                    testInvestments, 
                    testCompanies
                )
            ), 
            JSON.stringify(expectedResult),
        );
    });
  });
});

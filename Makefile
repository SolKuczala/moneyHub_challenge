start-financial-companies:
	cd financial-companies/ && npm install && npm start

start-investments:
	cd investments/ && npm install && npm start

start-admin:
	cd admin/ && npm install && npm start

# With all services running, run this command to generate the CSV file.
tests-manual:
	curl "http://localhost:8083/admin/generatecsv"

tests-unit-with-coverage:
	cd admin/ && npm run test

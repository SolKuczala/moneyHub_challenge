start-financial-companies:
	cd financial-companies/ && npm install && npm start

start-investments:
	cd investments/ && npm install && npm start

start-admin:
	cd admin/ && npm install && npm start

tests:
	curl "http://localhost:8083/admin/generatecsv"
	
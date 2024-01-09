start-financial-companies:
	cd financial-companies/ && npm install && npm start

start-investments:
	cd investments/ && npm install && npm start

start-services: start-financial-companies start-investments

tests:
	
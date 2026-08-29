.PHONY: install seed dev start test validate analytics docker-up docker-down clean

# Developer Command Shortcuts

install:
	npm install

seed:
	node server/db/seed.js

dev:
	npm run dev

start:
	npm start

test:
	npm test

validate:
	python scripts/validate_platform.py

analytics:
	python scripts/analytics_exporter.py

docker-up:
	docker-compose up -d --build

docker-down:
	docker-compose down

clean:
	rm -f server/db/edunova.db scripts/analytics_report.csv

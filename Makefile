SRCS= ./docker-compose.yaml

all: up

clean:
	docker rm backend  -f -v
	docker rm frontend -f -v
	docker rm dev-db -f

stop:
	docker stop backend || true
	docker stop frontend || true
	docker stop dev-db || true

up: stop
	docker compose -f $(SRCS) up -d --build
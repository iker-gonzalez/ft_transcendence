SRCS= ./docker-compose.yaml

all: up

clean:
	docker rm backend  -f -v
	docker rm frontend -f -v
	docker rm dev-db -f
	docker rm test-db -f
	docker rm prisma-studio -f
	docker rm backend-e2e -f
	rm -rf server/public/uploads/avatars/*

stop:
	docker stop backend || true
	docker stop frontend || true
	docker stop dev-db || true
	docker stop test-db || true
	docker stop prisma-studio || true
	docker stop backend-e2e || true

up: stop
	docker compose -f $(SRCS) up -d --build
	docker compose logs --follow

up-build: stop
	docker-compose up --build

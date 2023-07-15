SRCS= ./docker-compose.yaml

all: up

up:
	docker compose -f $(SRCS) up -d --build
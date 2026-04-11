.PHONY: up down build restart logs logs-backend logs-frontend logs-db ps \
	shell-backend shell-frontend shell-db migrate reset-db clean clean-data help

COMPOSE := docker compose

up:
	$(COMPOSE) up -d 

down:
	$(COMPOSE) down

build:
	$(COMPOSE) build

restart: down up

logs:
	$(COMPOSE) logs -f

logs-backend:
	$(COMPOSE) logs -f backend

logs-frontend:
	$(COMPOSE) logs -f frontend

logs-db:
	$(COMPOSE) logs -f sqlserver

ps:
	$(COMPOSE) ps

shell-backend:
	$(COMPOSE) exec backend sh

shell-frontend:
	$(COMPOSE) exec frontend sh

shell-db:
	$(COMPOSE) exec sqlserver /bin/bash

migrate: up
	@echo "Backend applies migrations on startup."

reset-db: down
	$(COMPOSE) down -v
	$(COMPOSE) up -d --build

clean: down
	$(COMPOSE) down -v
	docker system prune -f

clean-data:
	$(COMPOSE) down -v
	@echo "All data (volumes) removed."

help:
	@echo "Matcha Local Development - Makefile targets"
	@echo ""
	@echo "  make up           - Start stack (build + run in background)"
	@echo "  make down         - Stop stack"
	@echo "  make build        - Build/rebuild images"
	@echo "  make restart      - Stop then start stack"
	@echo "  make logs         - Follow all service logs"
	@echo "  make logs-backend - Follow backend logs"
	@echo "  make logs-frontend- Follow frontend logs"
	@echo "  make logs-db      - Follow SQL Server logs"
	@echo "  make ps           - List running containers"
	@echo "  make shell-backend - Shell into backend container"
	@echo "  make shell-frontend- Shell into frontend container"
	@echo "  make shell-db     - Shell into SQL Server container"
	@echo "  make migrate      - Start stack (migrations auto-apply on backend)"
	@echo "  make reset-db     - Full DB reset (remove volumes, restart stack)"
	@echo "  make clean        - Stop stack, remove volumes, prune Docker"
	@echo "  make clean-data   - Stop stack and remove all volumes (database, etc.)"
	@echo "  make help         - Show this help"

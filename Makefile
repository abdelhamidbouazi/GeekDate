.PHONY: up down build restart logs logs-backend logs-frontend logs-db ps \
	shell-backend shell-frontend shell-db migrate reset-db clean clean-data \
	seed remove-seed help

COMPOSE := docker compose
BACKEND_PORT ?= 8080

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

seed: up
	@echo "Waiting for backend to be ready..."
	@until curl -sf http://localhost:$(BACKEND_PORT)/health > /dev/null 2>&1 || \
	       curl -sf http://localhost:$(BACKEND_PORT)/api/seed > /dev/null 2>&1; do \
	    sleep 2; \
	done 2>/dev/null; true
	@echo "Seeding 600 users..."
	@curl -sf -X POST "http://localhost:$(BACKEND_PORT)/api/seed?force=false" \
	    -H "Content-Type: application/json" | cat
	@echo ""
	@echo "Done. Run 'make remove-seed' to undo."

remove-seed:
	@echo "Removing seed data..."
	@curl -sf -X DELETE "http://localhost:$(BACKEND_PORT)/api/seed" \
	    -H "Content-Type: application/json" | cat
	@echo ""
	@echo "Seed data removed."

help:
	@echo "SparkDates Local Development - Makefile targets"
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
	@echo "  make seed         - Seed 600 diverse fake users (dev only)"
	@echo "  make remove-seed  - Remove all seeded users (dev only)"
	@echo "  make help         - Show this help"

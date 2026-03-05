.PHONY: help setup install init verify clean tree \
	backend-install backend-build backend-test backend-run \
	frontend-install frontend-build frontend-lint frontend-run

help:
	@echo "Single root Makefile for full project orchestration."
	@echo ""
	@echo "Core targets:"
	@echo "  make setup            - init + install dependencies"
	@echo "  make install          - install backend + frontend dependencies"
	@echo "  make verify           - backend compile + frontend build"
	@echo "  make clean            - remove generated artifacts"
	@echo ""
	@echo "Backend targets:"
	@echo "  make backend-install  - resolve Maven dependencies"
	@echo "  make backend-build    - compile backend (skip tests)"
	@echo "  make backend-test     - run backend tests"
	@echo "  make backend-run      - run Spring Boot app"
	@echo ""
	@echo "Frontend targets:"
	@echo "  make frontend-install - install npm dependencies"
	@echo "  make frontend-lint    - run frontend lint"
	@echo "  make frontend-build   - build frontend"
	@echo "  make frontend-run     - start Vite dev server"

setup: init install

install: backend-install frontend-install

init:
	@mkdir -p backend frontend docs
	@echo "Project directories ready."

backend-install:
	@cd backend && chmod +x mvnw && ./mvnw -q dependency:resolve
	@echo "Backend dependencies resolved."

backend-build:
	@cd backend && ./mvnw -q -DskipTests compile

backend-test:
	@cd backend && ./mvnw test

backend-run:
	@cd backend && ./mvnw spring-boot:run

frontend-install:
	@cd frontend && npm install
	@echo "Frontend dependencies installed."

frontend-lint:
	@cd frontend && npm run lint

frontend-build:
	@cd frontend && npm run build

frontend-run:
	@cd frontend && npm run dev

verify: backend-build frontend-build
	@echo "Verification checks passed."

clean:
	@rm -rf backend/target frontend/dist frontend/.vite
	@echo "Generated artifacts cleaned."

tree:
	@find . -maxdepth 2 -type d | sort

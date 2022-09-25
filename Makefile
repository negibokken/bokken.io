up:
	docker compose -f docker-compose.dev.yml up -d

up_h:
	docker compose -f docker-compose.dev.yml up -d https-portal

up_b:
	docker compose -f docker-compose.dev.yml up -d bokken_io

restart:
	docker compose down && docker compose -f docker-compose.dev.yml up -d

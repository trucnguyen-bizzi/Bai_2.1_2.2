# Unit 02: Postgres bằng Docker Compose

## Goal

Chạy PostgreSQL 16 local bằng một lệnh, có healthcheck, dữ liệu được giữ lại khi
tắt container. Không dùng Prisma ở unit này.

## Design

Không có giao diện. Service tên `postgres`, container `training-postgres`.

## Implementation

### docker-compose.yml
- Image `postgres:16`; `restart: unless-stopped`.
- Biến môi trường `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` đọc từ `.env`
  (mặc định `training` / `training` / `training_db`).
- Cổng `${POSTGRES_PORT:-5433}:5432` để đổi được khi cổng bị chiếm; mặc định dùng host port 5433.
- Volume `pgdata` để giữ dữ liệu.
- Healthcheck bằng `pg_isready`, để `docker compose up -d --wait` chờ DB sẵn sàng.

### Scripts và .env
- `db:up` = `docker compose up -d --wait`, `db:down`, `db:reset` (`down -v`, mất dữ liệu).
- `.env` và `.env.example` có `POSTGRES_*` và `DATABASE_URL` khớp nhau, mặc định dùng host port 5433.

## Dependencies

Không có package mới. Cần Docker Desktop đang chạy.

## Verify when done

- [ ] `npm run db:up` kết thúc thành công, `docker compose ps` báo `healthy`
- [ ] `docker exec -it training-postgres psql -U training -d training_db -c "SELECT version();"` in phiên bản Postgres
- [ ] `docker compose down` rồi `npm run db:up` lại: container khởi động bình thường
- [ ] Đổi `POSTGRES_PORT` và `DATABASE_URL` sang cổng khác vẫn chạy được

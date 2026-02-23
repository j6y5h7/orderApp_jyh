# order-app-server

커피 주문 앱 백엔드 (Express.js). 프로젝트 루트의 `server` 폴더에 위치합니다.

## 요구 사항

- Node.js 18+
- PostgreSQL (로컬 또는 원격)

## 설치

```bash
cd server
npm install
```

## 환경 변수 (.env)

프로젝트 루트의 `server` 폴더에 `.env` 파일을 두고 다음 값을 설정합니다.  
(없으면 `.env.example`을 복사해 `.env`로 저장한 뒤 값을 채우세요.)

| 변수 | 설명 | 예시 |
|------|------|------|
| PORT | 서버 포트 | 3001 |
| PGHOST | PostgreSQL 호스트 | localhost |
| PGPORT | PostgreSQL 포트 | 5432 |
| PGUSER | DB 사용자 | postgres |
| PGPASSWORD | DB 비밀번호 | (본인 비밀번호) |
| PGDATABASE | DB 이름 | order_app |

PostgreSQL에 `order_app` 데이터베이스를 미리 생성해 두어야 합니다.

```sql
CREATE DATABASE order_app;
```

테이블·시드 데이터는 다음 명령으로 한 번 실행합니다.

```bash
npm run db:init
```

## 실행

- **개발** (파일 변경 시 자동 재시작, Node 18+ `--watch` 사용):
  ```bash
  npm run dev
  ```
- **일반 실행**:
  ```bash
  npm start
  ```

기본 포트: `3001`. `PORT` 환경 변수로 변경 가능합니다.

## 확인

- 서버 기동 후 브라우저 또는 curl:
  ```bash
  curl http://localhost:3001/health
  ```
  응답 예: `{"ok":true,"message":"order-app-server"}`

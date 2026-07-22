# MeepleDay

보드게임 **펀딩·선주문·특가** 이벤트를 국내·해외 구분 없이 한 화면에서 보는 서비스.

업계 이벤트가 텀블벅·이노펀딩·Kickstarter·Gamefound·각종 쇼핑몰에 흩어져 있어 일정과 상품 정보를 한눈에 파악하기 어렵다는 문제에서 출발.

## 현재 상태 (Phase 1)

- 통합 피드: 지역/유형/플랫폼/상태 필터, **마감임박순** 정렬
- 이벤트 상세: 달성률·마감일·원본 링크
- 제보(크라우드소싱): 누구나 제출 → 운영자 검수 후 게시
- 운영자 검수 큐: 승인/반려
- **인증은 마지막 단계(Phase 2)** — 개발·테스트 편의를 위해 로그인 벽을 뒤로 미룸

로드맵·설계 근거는 [docs/adr](docs/adr), Phase 2 기능명세는 [docs/spec/phase2.md](docs/spec/phase2.md), 성공지표·데이터 수급은 [docs/product.md](docs/product.md) 참조.

## 스택

- Backend: Kotlin 1.9 · Spring Boot 3.4 · JPA/Hibernate · Flyway
- DB: dev = H2(PostgreSQL 호환 모드), prod = PostgreSQL
- Frontend: React 18 · TypeScript · Vite

## 실행

### Backend

```bash
./gradlew bootRun            # 기본 dev 프로파일, http://localhost:8080
# 포트 충돌 시:
./gradlew bootRun --args='--server.port=18080'
```

dev 프로파일은 인메모리 H2 + 샘플 이벤트 시드([DevDataLoader](src/main/kotlin/com/meepleday/event/DevDataLoader.kt))로 뜬다.

### Frontend

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173, /api 는 백엔드로 프록시
# 백엔드가 8080이 아니면:
BACKEND_URL=http://localhost:18080 npm run dev
```

### 테스트

```bash
./gradlew test               # 도메인 단위 + API 통합 테스트
```

## API 요약

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/events` | 공개 피드 (PUBLISHED만, 필터·정렬·페이징) |
| GET | `/api/events/{id}` | 이벤트 상세 (PUBLISHED만) |
| POST | `/api/events` | 이벤트 제보 (PENDING 생성) |
| GET | `/api/admin/events?status=PENDING` | 검수 큐 |
| PATCH | `/api/admin/events/{id}/moderation` | 승인/반려 |

> `/api/admin/**` 은 Phase 2에서 인증으로 잠글 지점. 지금은 열려 있음.

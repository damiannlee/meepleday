# MeepleDay

흩어져 있는 **보드게임 이벤트 일정**을 국내·해외 구분 없이 한 곳에서 보는 서비스.

펀딩·선주문·특가·오프라인 행사, 그리고 아직 열리지 않은 예고까지 — 보드게임과 관련된 일정이라면 유형을 가리지 않고 수용. 정보가 텀블벅·Kickstarter·Gamefound·보드라이프·커뮤니티 공지에 흩어져 있어 "언제 무슨 일이 있는지" 파악에 반복 노동이 드는 문제에서 출발.

제품 정의의 단일 소스는 **[기획서(PRD)](docs/prd.md)**, 설계 근거는 [docs/adr](docs/adr).

## 현재 위치

- **[PRD](docs/prd.md) 확정** — 서비스 정체성을 "펀딩 애그리게이터"에서 "이벤트 캘린더"로 재정의, 로드맵 전면 재수립.
- **M0(재설계 기반) 완료, M1(발견) 착수 전** — 데이터 모델은 PRD에 맞춰 갱신됐고, 타임라인 UI 등 화면 작업이 다음 단계.

로드맵: **M0 재설계 기반 → M1 발견 → M2 공급 → M3 추적 → M4+ 장기 비전** ([PRD §7](docs/prd.md#7-로드맵-전면-재수립)).

## 구현 현황

| 영역 | 상태 | 비고 |
|---|---|---|
| 이벤트 피드 (필터·정렬·페이징) | 구현됨 | **카드 그리드 → 타임라인으로 교체 예정** ([PRD §5.1](docs/prd.md#51-첫-화면--타임라인-기간-그룹), M1) |
| 이벤트 상세 | 구현됨 | 달성률 바 제거됨(M0, [PRD §4.4](docs/prd.md#44-데이터-신선도)) |
| 제보 + 운영자 검수 | 구현됨 | URL 자동 채움·게임 매칭 UI 추가 예정 |
| 익명 제보 남용 방지 | 구현됨 | honeypot + IP rate limit ([ADR-0006](docs/adr/0006-abuse-prevention.md)) |
| 인증 (Kakao/Google OAuth2) | **구현됨** | 세션 쿠키 + CSRF. `/api/admin/**` 은 이미 ADMIN 전용으로 잠김 |
| Game 엔티티 | **구현됨(M0)** | `Event.gameId`로 연결. 매칭 후보 제시 UI는 M2 ([PRD §4.2](docs/prd.md#42-game-엔티티)) |
| 오프라인 행사 유형 | **구현됨(M0)** | `EventType.OFFLINE_EVENT` + 장소·주소·참가비·예매 링크. 전용 카드 UI는 M1 |
| 예고 이벤트(`ANNOUNCED`) | **구현됨(M0)** | 날짜 미정 이벤트 상태 파생, `scheduleNote` 자유 입력 ([ADR-0004](docs/adr/0004-derived-status.md)) |
| URL 자동 채움 | 미구현 | M1 ([PRD §4.3](docs/prd.md#43-등록-자동-채움)) |
| OG 프리렌더 | 미구현 | M1, 공유 유입의 전제 조건 ([PRD §6.1](docs/prd.md#61-공유-미리보기-og--1급-요구사항)) |
| 북마크 · 마감임박 알림 | 미구현 | M3 ([docs/spec/m3-tracking.md](docs/spec/m3-tracking.md)) |

## 스택

- Backend: Kotlin 1.9 · Spring Boot 3.4 · Spring Security(OAuth2 Client) · JPA/Hibernate · Flyway
- DB: dev = H2(PostgreSQL 호환 모드), prod = PostgreSQL
- Frontend: React 18 · TypeScript · Vite (CSR SPA — [ADR-0001](docs/adr/0001-tech-stack.md))

## 실행

### Backend

```bash
./gradlew bootRun            # 기본 dev 프로파일, http://localhost:8080
# 포트 충돌 시:
./gradlew bootRun --args='--server.port=18080'
```

dev 프로파일은 인메모리 H2 + 샘플 이벤트 시드([DevDataLoader](src/main/kotlin/com/meepleday/event/DevDataLoader.kt))로 뜬다.

소셜 로그인을 실제로 쓰려면 Kakao/Google OAuth2 클라이언트 자격증명 설정이 필요하다. 미설정이어도 공개 피드·제보는 동작한다.

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

| Method | Path | 인증 | 설명 |
|---|---|---|---|
| GET | `/api/events` | — | 공개 피드 (PUBLISHED만, 필터·정렬·페이징) |
| GET | `/api/events/{id}` | — | 이벤트 상세 (PUBLISHED만) |
| POST | `/api/events` | — | 이벤트 제보 (PENDING 생성, 익명 허용) |
| GET | `/api/admin/events?status=PENDING` | ADMIN | 검수 큐 |
| PATCH | `/api/admin/events/{id}/moderation` | ADMIN | 승인/반려 |
| GET | `/api/me` | 로그인 | 현재 사용자 |
| GET | `/oauth2/authorization/{kakao\|google}` | — | 소셜 로그인 시작 |
| POST | `/api/auth/logout` | 로그인 | 로그아웃 |

- 인증은 **세션 쿠키 + CSRF 쿠키**([SecurityConfig](src/main/kotlin/com/meepleday/user/SecurityConfig.kt)). `/api/**` 인증 실패는 리다이렉트가 아니라 `401`.
- ADMIN은 자가가입 불가 — 허용목록(`AdminAllowlistProperties`)으로 부여.

## 문서

| 문서 | 내용 |
|---|---|
| [docs/prd.md](docs/prd.md) | **기획서 — 제품 정의 단일 소스** |
| [docs/product.md](docs/product.md) | 성공지표 · 데이터 수급 전략 |
| [docs/adr](docs/adr) | 설계 결정과 기각한 대안 |
| [docs/spec/m3-tracking.md](docs/spec/m3-tracking.md) | M3(북마크·알림) 기능명세 |

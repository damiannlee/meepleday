# CLAUDE.md — MeepleDay

흩어져 있는 보드게임 이벤트 일정(펀딩·선주문·특가·오프라인 행사·예고)을 국내·해외 통합해 한 곳에서 보는 서비스. **제품 정의 단일 소스 = [docs/prd.md](docs/prd.md)**, 개요·실행은 [README](README.md), 설계 근거는 [docs/adr](docs/adr).

## 현재 위치

- **[PRD](docs/prd.md) 확정, M0(재설계 기반) 완료, M1(발견) 착수 전.** 정체성을 "펀딩 애그리게이터" → "보드게임 이벤트 캘린더"로 재정의하며 Phase 1/2 구분 폐기.
- 로드맵: **M0 재설계 기반 → M1 발견 → M2 공급 → M3 추적 → M4+ 장기 비전** ([PRD §7](docs/prd.md#7-로드맵-전면-재수립)).
- 구현 완료: 피드·상세·제보·검수, 남용 방지, **인증(Kakao/Google OAuth2, 세션 쿠키+CSRF)**, **M0 데이터 모델(`Game` 엔티티, `OFFLINE_EVENT`, `ANNOUNCED` 상태, 달성률 필드 제거)**. 현황표는 [README](README.md#구현-현황).
- 미구현 주요 항목: URL 자동 채움, OG 프리렌더, 타임라인 레이아웃, 키워드 검색, 게임 매칭 후보 제시 UI, 북마크·알림.
- 데이터 공급: 운영자 등록 + 사용자 제보. 자동 수집은 M4+ defer. 수급·성공지표 [docs/product.md](docs/product.md).

## 아키텍처 요점 (재서술 대신 포인터)

- 제보는 별도 테이블 없이 `Event.moderationStatus`로 통합 — [ADR-0002](docs/adr/0002-moderation-on-event.md).
- 이벤트 진행 상태(ANNOUNCED/UPCOMING/ONGOING/ENDING_SOON/ENDED)는 저장 안 하고 파생 — [ADR-0004](docs/adr/0004-derived-status.md). `startAt`/`endAt` 둘 다 null이면 `ANNOUNCED`(M0에서 해결).
- `/api/admin/**` 는 **이미 `hasRole("ADMIN")`으로 잠김** — [SecurityConfig](src/main/kotlin/com/meepleday/user/SecurityConfig.kt). ADMIN은 자가가입 불가(허용목록 부여).
- 게임 단위 묶음은 `Game` 1:N `Event`(`Event.gameId`, nullable FK) — [ADR-0007](docs/adr/0007-game-entity.md). 동일 게임 판정은 사람이(검수 단계, UI는 M2).
- 첫 화면은 기간 그룹 타임라인 — [ADR-0008](docs/adr/0008-timeline-layout.md). 현재 카드 그리드 구현은 교체 대상.
- 공유 유입이 주 채널 → CSR SPA 유지하되 **OG 프리렌더 필수** — [ADR-0001](docs/adr/0001-tech-stack.md).
- URL 자동 채움(단일 지시형 페치)은 자동 수집(대량 크롤링)과 별개 사안 — [ADR-0009](docs/adr/0009-fetch-vs-crawl.md). SSRF·자원 상한·rate limit 필수.
- 성장 목표는 명시하되 캐시·프록시는 미구현(관측 후 도입) — [ADR-0010](docs/adr/0010-growth-target-unbuilt.md).
- 배포 타깃 AWS 서울(S3+CloudFront·EC2·RDS·Route53), 공개 배포는 M3 완료 후 완성형 출시 — [ADR-0005](docs/adr/0005-deployment-target.md).
- 익명 제보 남용: 검수 게이트가 공개 피해 1차 차단, honeypot+IP rate limit 최소 방어 — [ADR-0006](docs/adr/0006-abuse-prevention.md).
- 검색은 `LIKE` 부분일치로 시작(H2↔PostgreSQL 이식성), 게임 제목은 `gameId` 집합 경유 **2단계 질의**(join 불가). FTS는 규모 관측 시 defer — [ADR-0011](docs/adr/0011-search.md), 명세 [docs/spec/search.md](docs/spec/search.md).

## 코딩 컨벤션

**언어 무관**
- 주석·로그 = 영어. 문서·커밋 = 한국어(개조식).
- N+1 금지: 반복문 내 쿼리 금지, 배치 로딩 + `groupBy`/`associateBy`.
- wildcard import 금지. 매직넘버·반복 문자열 상수화.
- 함수 바디 약 30줄 상한, 넘으면 `validateXxx`/`buildXxx`/`resolveXxx` private 헬퍼로 추출.
- 트랜잭션 경계 명시: 읽기 `@Transactional(readOnly = true)`, 쓰기 `@Transactional`.
- 현재 유저는 `SecurityContext` 직접 접근 금지, [`CurrentUserProvider`](src/main/kotlin/com/meepleday/user/CurrentUserProvider.kt) 주입.

**Kotlin/Spring**
- Null safety: `?: throw` 엘비스만. `!!`·`requireNotNull()`·`if (x == null) throw` 금지.
- DTO 변환: 서비스가 companion `.of()` 팩토리로 DTO 리턴. 컨트롤러가 `.of()` 직접 호출 금지.
- 스코프 함수 `.apply{}.also{}.let{}` 3단 체이닝 금지.
- 문자열 결합은 템플릿 리터럴만.
- 엔티티 상태 전이는 도메인 메서드로 캡슐화(예: `Event.publish()`/`reject()`).

## DB / 마이그레이션

- 스키마 단일 소스 = Flyway(`src/main/resources/db/migration`). `ddl-auto=validate`로 엔티티↔스키마 정합 검증.
- dev H2는 PostgreSQL 호환 모드 → 마이그레이션 이식성. 새 스키마 변경은 PostgreSQL/H2 양쪽에서 유효한 SQL만.

## 검증

- 완료 주장 전 `./gradlew test` 전체 통과 확인(증거 없이 "됐다" 금지).
- 새 기능은 단위 + 통합 테스트 동반. 자체 리뷰: N+1·트랜잭션 경계·타 유저 자원 접근 차단.

## Git

- `main` 직접 커밋 금지 — 브랜치 생성 후 작업.
- 커밋 = Conventional Commits + 본문 한국어 개조식. PR 생성은 명시적 요청 시에만.

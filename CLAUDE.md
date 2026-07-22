# CLAUDE.md — MeepleDay

보드게임 펀딩·선주문·특가 이벤트를 국내·해외 통합해 한눈에 보는 서비스. 개요·실행은 [README](README.md), 설계 근거는 [docs/adr](docs/adr).

## 현재 위치

- Phase 1(진행): 조회 피드 + 제보(크라우드소싱) + 운영자 검수. 인증 없음.
- Phase 2(예정): 인증(Spring Security OAuth2, Kakao/Google 소셜 로그인) → 북마크 → 마감임박 이메일 알림(`@Scheduled`). 근거 [ADR-0003](docs/adr/0003-auth-last.md), 기능명세 [docs/spec/phase2.md](docs/spec/phase2.md).
- 데이터 공급: 운영자 등록 + 사용자 제보. 크롤러/스크래퍼는 후순위. 수급·성공지표 [docs/product.md](docs/product.md).

## 아키텍처 요점 (재서술 대신 포인터)

- 제보는 별도 테이블 없이 `Event.moderationStatus`로 통합 — [ADR-0002](docs/adr/0002-moderation-on-event.md).
- 이벤트 진행 상태(UPCOMING/ONGOING/ENDING_SOON/ENDED)는 저장 안 하고 파생 — [ADR-0004](docs/adr/0004-derived-status.md).
- `/api/admin/**` 는 Phase 2에서 인증으로 잠글 지점. 현재 무인증이나 로컬 개발 한정(공개 배포는 인증 완비 후라 노출 창 없음).
- 공개 배포는 Phase 2 완료 후 완성형 출시 → 관리형 RDS로 바로 시작. 배포 타깃 AWS 서울(S3+CloudFront·EC2·RDS·Route53) — [ADR-0005](docs/adr/0005-deployment-target.md).
- 익명 제보 남용: 검수 게이트가 공개 피해 1차 차단, honeypot+IP rate limit 최소 방어 — [ADR-0006](docs/adr/0006-abuse-prevention.md).

## 코딩 컨벤션

**언어 무관**
- 주석·로그 = 영어. 문서·커밋 = 한국어(개조식).
- N+1 금지: 반복문 내 쿼리 금지, 배치 로딩 + `groupBy`/`associateBy`.
- wildcard import 금지. 매직넘버·반복 문자열 상수화.
- 함수 바디 약 30줄 상한, 넘으면 `validateXxx`/`buildXxx`/`resolveXxx` private 헬퍼로 추출.
- 트랜잭션 경계 명시: 읽기 `@Transactional(readOnly = true)`, 쓰기 `@Transactional`.
- 현재 유저는 `SecurityContext` 직접 접근 금지, `CurrentUserProvider`류 주입(Phase 2).

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

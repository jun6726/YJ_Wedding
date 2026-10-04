# 이미지 관리

- `gallery/thumbs/`: 400px 격자 및 로딩 중 미리보기.
- `gallery/view/{600,900,1200,1440}/`: 화면 크기와 픽셀 밀도에 맞춰 선택하는 넘겨보기용 WebP.
- `gallery/large/`: 1600px 크게보기용 WebP.
- `gallery/manifest.json`: 갤러리 파일·해상도·용량. 원본과 모든 갤러리 해상도에서 `gallery01`–`gallery24` 번호를 공유합니다. `original`의 숫자 파일명 순서로 자동 생성합니다. JPG/JPEG 확장자의 대소문자를 지원합니다.
- `intro/`: 수동 편집한 신랑·신부 사진, 종이 프레임과 배경.
- `hero/gallery12.webp`: 현재 히어로 사진. 기존 크기·색감으로 유지한 별도 히어로 파일입니다.
- `content/`: 인사말, 스토리, 엔딩 사진. 인사말은 `greeting/{600,1200,1440}/gallery07.webp`, 엔딩은 `ending/{600,1200,1440}/gallery20.webp`로 별도 관리합니다.
- `common/`: 공유 썸네일, 아이콘, 티맵 웹아이콘. 기존 PNG는 보관용 소스입니다.
- `original/`, `design/`: 재생성 및 복원용 소스. 배포에 포함되지 않습니다.

갤러리만 재생성하려면 Sharp가 설치된 환경에서 다음을 실행합니다.

```sh
NODE_PATH=/path/to/node_modules node scripts/optimize-images.cjs
```

기존 화질 85를 유지하고 원본을 확대하지 않습니다. 인트로·히어로·본문 사진은 기존 편집을 유지하고 같은 사진의 새 번호로 파일명과 참조만 바꿉니다. `original`의 실제 파일을 스캔하여 갤러리 목록·해상도·순서를 자동 갱신합니다. 사진 해시로 좋아요·댓글 연결을 유지합니다.

배포용 폴더를 만들려면 `node scripts/build-site.cjs`를 실행합니다. 현재 HTML과 갤러리 매니페스트에서 사용되는 파일만 `deploy/`에 복사합니다. 폴더 전체를 삭제·재생성하지 않고 내용을 갱신하며 빈 중복 폴더와 미사용 배포 파일은 제거합니다. 생성 자체는 공개 배포를 하지 않습니다.

사진 번호·촬영 원본명·섹션 소스는 `gallery/source-map.json`에 기록합니다. 번호 변경 전 파일명은 저장된 좋아요·댓글 연결용으로만 유지합니다.

- `effects/sakura/`: 실제 표시하는 꽃잎 8종(96px 투명 WebP).
- `design/sakura-layers/`: 원본 투명 PNG 레이어 8종과 제작 프롬프트 설명.

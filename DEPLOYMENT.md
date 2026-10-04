# main 최상위 폴더에서 배포

현재 작업 파일과 공개 배포 파일은 동일합니다. `main`에 커밋·푸시하면
GitHub Pages가 저장소 최상위(`/`)를 자동으로 배포합니다.
`docs/`, `deploy/`, 배포 ZIP, 배포용 복사 스크립트 및 커밋 훅은 사용하지 않습니다.

공개 주소: https://jun6726.github.io/YJ_Wedding/
이 주소는 QR코드에 등록되어 있으므로 별도 사용자 지시가 없으면 변경하지 않습니다.
저장소 이름·소유자·Pages 도메인을 바꾸지 않습니다.

최상위 `index.html`과 `images/`, `font/`, `bgm.mp3`를 그대로 사용합니다.
사용자 승인에 따라 원본 이미지와 디자인 원본도 공개 경로에 포함됩니다.
`.nojekyll`로 파일을 그대로 배포합니다. 백업은 `.gitignore`로 커밋에서 제외합니다.

배포 결과는 GitHub Actions의 기본 `pages build and deployment` 작업에서 확인합니다.
실패하면 기존 공개 버전이 유지되므로 오류를 해결한 뒤 다시 푸시합니다.

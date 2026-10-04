# main 푸시와 공개 배포

`main`에 푸시하면 GitHub Pages가 `main/docs`를 공개 청첩장으로 배포합니다.
공개 주소는 https://jun6726.github.io/YJ_Wedding/ 입니다.
별도의 gh-pages 푸시나 GitHub Actions 배포 워크플로는 사용하지 않습니다.

현재 작업 저장소에는 `.githooks/pre-commit`을 설정했습니다. main에서 커밋할 때
`node scripts/build-site.cjs`가 공개용 파일을 `deploy/`와 `docs/`에 생성하고,
`docs/`를 같은 커밋에 자동으로 포함합니다. 작업 파일을 스테이징한 후 커밋·푸시하면 됩니다.
스테이징하지 않은 소스 변경이 있으면, 커밋된 소스와 공개 파일이 달라지지 않도록 커밋을 중단합니다.

`docs/`는 배포 생성물이므로 직접 수정하지 않습니다. 원본 이미지, 백업, 스크립트,
디자인 원본은 사이트 배포에 포함하지 않습니다. `deploy/`와 `deploy.zip`은 로컬 생성물입니다.

다른 PC에서 새로 클론한 경우 다음 설정을 한 번 적용해야 합니다.

```sh
git config core.hooksPath .githooks
```

커밋 훅을 생략하거나 다른 PC에서 설정하지 않았다면, 커밋 전에 빌드하고 `docs/`도 스테이징해야 합니다.
배포 완료 여부는 GitHub Actions의 기본 `pages build and deployment` 작업에서 확인합니다.
`gh-pages` 브랜치는 필요하지 않으며, 삭제는 사용자 승인 후 진행합니다.

# 청첩장 종이 이미지

2026-10-03에 built-in `image_gen`으로 영상의 종이 재질을 참고해 새로 생성했다. 원본 서비스의 종이 이미지 파일을 확보한 것은 아니다. 신랑·신부 사진은 생성/수정하지 않았으며 기존 갤러리 사진을 HTML/CSS로 배치했다.

- `heart-paper-frame.png`: 실제 알파 투명도가 있는 구겨진 흰 종이 하트 프레임. 원본 생성 PNG를 사용한다.
- `pink-paper.png`: 원본 생성 분홍 종이 텍스처.
- `pink-paper.jpg`: 웹 배경에서 사용하는 JPEG 인코딩 버전. PNG보다 전송량을 줄이기 위해 macOS `sips`로 변환했다.

공통 참고 이미지: `references/instagram-Dcx-b-zmoHu/frames/07-03.00.jpg`.

## 흰 종이 프레임 생성 프롬프트

```text
Use case: product-mockup. Asset type: transparent PNG paper frame for a mobile wedding invitation. Reference image: only for the tactile wrinkled WHITE square paper around a heart-shaped portrait opening; ignore all people, pink background, scenery, text. Generate a single flat square off-white piece of lightly crumpled thin paper, photographed straight overhead, filling nearly the whole square canvas, straight outer edges. A large central irregular heart-shaped cut-out, about 70% of paper width and 72% height, with small hand-torn facets around edges, positioned centrally. Both the heart hole and outside the square paper MUST be transparent alpha, no picture inside the hole. Delicate real photographic creases, very soft gray shadows on folds, ivory white (#f2f1ee), no heavy brown coloration. No text, no person, no props, no mockup, no pink. Purpose: overlay on a portrait photograph so it appears through the heart opening.
```

`transparent_background: true`

## 분홍 종이 배경 생성 프롬프트

```text
Use case: product-mockup. Asset type: full-bleed background paper texture image for a mobile wedding invitation intro. Reference image is a color and material reference ONLY for the pale pink paper rectangle at the center. Generate just an empty flat pale blush pink paper surface filling the ENTIRE image edge to edge, no border. Match the subtle tiny paper fibers, warm faded pink (#efdadc approximately), gentle natural mottling and fine grain of the center panel in reference. Very even soft diffuse lighting, extremely subtle paper texture, no crumpling or strong creases. No white frames, no hearts, no photographs, no people, no text, no scenery, no objects, no gradients or shadows. This is a clean quiet background material.
```

`transparent_background: false`

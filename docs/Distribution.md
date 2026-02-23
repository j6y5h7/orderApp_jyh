### Render.com을 이용한 배포 순서

아래는 프론트엔드, 백엔드, 데이터베이스를 render.com에 배포하는 기본적인 순서입니다.

---

#### 1. 데이터베이스(PostgreSQL) 생성

1. Render.com에 로그인합니다.
2. 왼쪽 메뉴에서 **Databases > New Database**를 클릭합니다.
3. 데이터베이스 이름, PostgreSQL 버전, 리전을 설정한 후 **Create Database**를 클릭합니다.
4. 생성이 완료되면 접속 정보(Host, Database, User, Password 등)를 확인할 수 있습니다.
5. **데이터베이스 URL**을 복사해둡니다. (백엔드에서 사용)

---

#### 2. 백엔드 API 배포

1. Github 등의 저장소에 백엔드 코드를 push합니다.
2. Render.com에서 **Services > New Web Service**를 선택합니다.
3. **Connect Repository**를 클릭하고, 백엔드 저장소를 선택합니다.
4. Service name, Region, Branch 등 환경설정을 하고, **Build Command**와 **Start Command**를 입력합니다.  
   - 예시 (Node.js):
     - Build Command: `npm install`
     - Start Command: `npm start`
5. **환경 변수(Env Vars)**에 DB 연결 정보 등 필요한 값을 등록합니다.
   - 예) `DATABASE_URL`  
6. **Create Web Service**를 클릭하여 배포를 시작합니다.
7. 배포가 완료되면, API 엔드포인트(도메인 주소)가 생성됩니다.

---

#### 3. 프론트엔드(Web) 배포

1. 프론트엔드 코드를 Github 등에 push합니다.
2. Render.com에서 **Services > New Static Site** 또는(리액트, 정적 웹이면 Static Site/Next.js 등 SSR이면 Web Service)  
   - React, Vue 등 SPA: Static Site
   - Next.js SSR: Web Service
3. 저장소를 연결하고, 환경설정(Build Command, Publish directory 등)을 입력합니다.
   - 예시 (React):
     - Build Command: `npm run build`
     - Publish directory: `build`
4. 환경 변수(API 서버 주소 등) 필요 시 등록합니다.
   - 예) `.env` 파일 내 `REACT_APP_API_URL`
5. **Create Static Site**(또는 Web Service)를 클릭합니다.
6. 배포가 완료되면, 웹사이트용 도메인(URL)이 생성됩니다.

---

#### 4. CORS 및 연결 테스트

- 프론트엔드에서 API 호출이 잘 되는지 확인합니다.
- CORS 이슈가 발생하면 백엔드에서 CORS 허용을 추가 설정해야 합니다.

---

#### 5. (선택) 커스텀 도메인 연결

- 프로젝트가 완성되면 render.com의 각각 서비스(Admin > Settings > Custom domains)에서 커스텀 도메인 연결도 가능합니다.

---

#### 참고

- 각 서비스 배포/빌드 로그는 render.com 대시보드에서 실시간으로 확인할 수 있습니다.
- 추가적으로 환경 변수 또는 배포 옵션은 프로젝트 특성에 맞게 조정해 주세요.

import express from 'express';
import connect from './schemas/index.js';

const app = express();
const router = express.Router();

connect();

// 애플리케이션 수준 미들웨어
app.use((req, res, next) => {
    console.log('애플리케이션 레벨 미들웨어');
    next();
});

// 라우터 수준 미들웨어
router.use((req, res, next) => {
    console.log('라우터 레벨 미들웨어');
    next();
});

// 라우터에 대한 특정 경로
router.get('/example', (req, res) => {
    return res.send('라우터 수준 미들웨어 예제');
});

// 라우터를 애플리케이션에 추가
app.use('/api', router);

app.use('/api/example' ,(req, res, next) => {
    console.log('애플리케이션 수준 미들웨어 예제');
    next();
})

app.use((req, res, next) => {
    console.log('여기까지?');
    next();
});

app.listen(3000, () => {
    console.log('서버가 3000번 포트에서 실행 중입니다.');
});
import express from 'express';
import joi from 'joi';
import Todo from '../schemas/todo.schema.js'

const router = express.Router();

const createdTodoSchema = joi.object({
    value: joi.string().min(1).max(50).required(),
})


// 할 일 등록 API
router.post('/todos', async (req, res, next) => {
    try {
        // 클라이언트로부터 받아온 value 데이터 가져오기

        const validateBody = await createdTodoSchema.validateAsync(req.body);

        const { value } = validateBody;

        //데이터 유효성 검사
        if (!value) {
            return res
                .status(400)
                .json({ errorMessage: '해야할 일 데이터가 존재하지 않습니다.' });
        }

        // 마지막 order 데이터
        const todoMaxOrder = await Todo.findOne().sort('-order').exec();

        const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

        const todo = new Todo({ value, order });
        await todo.save();

        return res.status(201).json({ todo });
    } catch (error) {
        //Router 다음에 있는 에러처리 미들웨어에 전달
        next(error);
    }
})

//목록 조회
router.get('/todos', async (req, res) => {
    // 목록 조회(내림차순)
    const todos = await Todo.find().sort('-order').exec();

    // 결좌 반환
    return res.status(200).json({ todos });
});


//순서 변경
router.patch('/todos/:todoId', async (req, res, next) => {
    const { todoId } = req.params;
    const { order, done, value } = req.body;

    //현재 order 알기
    const currentTodo = await Todo.findById(todoId).exec();
    if (!currentTodo) {
        return res.statusMessage(404).json({ errorMessage: '존재하지 않는 해야할 일 입니다.' });
    }

    if (order) {
        const targetTodo = await Todo.findOne({ order });
        if (targetTodo) {
            targetTodo.order = currentTodo.order;
            await targetTodo.save();
        }

        currentTodo.order = order;
    }

    if (done !== undefined) {
        currentTodo.doneAt = done ? new Date() : null;
    }

    if (value) {
        currentTodo.value = value;
    }

    await currentTodo.save();

    return res.status(200).json({});
})


//할 일 삭제
router.delete('/todos/:todoId', async (req, res) => {
    // 삭제할 '해야할 일'의 ID 값을 가져옵니다.
    const { todoId } = req.params;

    // 삭제하는 값 가져오기 :: TODO : 받아온 todo 값으로 삭제는 안 되나?
    const todo = await Todo.findById(todoId).exec();
    if (!todo) {
        return res
            .status(404)
            .json({ errorMessage: '존재하지 않는 todo 데이터입니다.' });
    }

    //삭제하기(mongoDB는 보통 언더바 사용(_))
    await Todo.deleteOne({ _id: todoId }).exec();

    return res.status(200).json({});
});

export default router;
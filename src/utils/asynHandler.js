const asynHandler = (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler(res,res,next)).catch((err) => next(err))
    }
}

export {asynHandler}


// const asynHandler = () => {};
// const asynHandler = (fn) => () => {};
// const asynHandler = (fn) => async () => {}; this all three type we can do easily;


// this is wraper function that we are going to use manywhere in form of try/catch; 
// const asynHandler = (fn) => async (req,res,next) => {
//     try{
//         await fn(res, res, next)
//     }catch (err) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// };
// PowerWise/backend/src/utils/catchAsync.js

const catchAsync = (fn) => (req, res, next) => {
    try {
        const result = fn(req, res, next);

        if (result && typeof result.then === 'function') {
            result.catch((err) => {
                if (typeof next === 'function') return next(err);
                res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
            });
        }
    } catch (err) {
        if (typeof next === 'function') return next(err);
        res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
    }
};

export default catchAsync;

const router = express.Router();

router.post('/', async (req, res) => {
    console.log('Received request at /api/admin/reports');
    const data = req.body;
    console.log(data);
});

class DevController {
    static test = (req, res) => {
        var data = {
            'data': 'Hello world'
        }
        res.json(data);
    }
}

module.exports = DevController
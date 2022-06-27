var express = require('express');
const router = express.Router();
router.use(express.json());

var db = require('./database.js');

//GET INFO BY stored procedure
router.get('/without_procedure', (req, res) => {
    var sql = `CALL without_parameter()`;
    db.query(sql, (err, result) => {
        if(err) {
            return res.send(err);
        } 
        return res.send(result.filter((_, index) => index != 2));
    });
});

//POST NEW STUDENT PROFILE
router.post('/in_parameter/', (req, res) => {
    let {stu_name, subject, college} = req.body;
    let class_ = req.body.class;
    var sql = `CALL in__parameter(?, ?, ?, ?)`;
    db.query(sql, [stu_name, class_, subject, college], (err, result) => {
        if(err) {
            return res.send(err);
        }
        return res.send(result[0][0]);
    });
});

//DELETE STUDENT PROFILE
router.delete('/out_parameter/', (req, res) => {
    var sql = `CALL out_parameter(@id, @name, ?, ?);
                SELECT @id;
                SELECT @name;`;
    var {id, name} = req.body;
    db.query(sql, [id, name], (err, result) => {
        if(err) {
            return res.send(err);
        }
        return res.send(result.filter((_, index) => index > 0));
    })
});

//UPDATE FACULTY INFO
router.patch('/inout_parameter', (req, res) => {
    var sql = `SET @fac_name = ?;
                CALL inout_parameter(?, @fac_name, ?, ?);
                SELECT @fac_name AS dept_name;`;
    var {fac_id, fac_name, dept_id, college} = req.body;
    db.query(sql, [fac_name, fac_id, dept_id, college], (err, result) => {
        if(err) {
            return res.send(err);
        }
        return res.send(result.filter((_, index) => {
            return index === 1 || index === 3;
        }));
    })
});


// PAGINATION (STUDENT INFO)
router.get('/pagination/:pageNum/:limit', (req, res) => {
    let offset = (req.params.pageNum - 1)* req.params.limit;
    let limit = req.params.limit;
    let sql = `CALL pagination(${offset}, ${limit});`
    db.query(sql, (err, result) => {
        if(err) {
            return res.send(err);
        }
        return res.send(result[0]);
    })
})

module.exports = router;

// //PASS ARRAY OF ID TO GET DATA
// router.get('/arrayOfID/', (req, res) => {
//     console.log(req.body.ids);
//     var sql = `CALL fetchFromArray(?);`;
//     var info = [];
//     for(let id of req.body.ids) {
//         db.query(sql, [id], (err, result) => {
//             if(err) return res.send(err);
//             info.push(result[0][0]);
//             if(req.body.ids.length === info.length) {
//                 output(info);
//             }
//         });
//     }
//     function output(info) {
//         return res.send(info);
//     }
// });


//PASS ARRAY OF ID TO GET DATA
router.get('/array/read', (req, res) => {
    // var sql = `SELECT * FROM student WHERE stu_id IN(?)`;
    var sql = `CALL fetchFromArray(?);`;
    db.query(sql, [req.body.ids], (err, result) => {
        if(err) return res.send(err);
        return res.send(result);
    });
});

//DELETE ARRAY OF ID 
router.delete('/array/delete', (req, res) => {
    var sql = `CALL deleteFromArray(?);`;
    db.query(sql, [req.body.ids], (err, result) => {
        if(err) return res.send(err);
        return res.send(result);
    });
});

//POST ARRAY OF STUDENT INFO
router.post('/array/add', (req, res) => {
    let {name, subject, college} = req.body;
    let classs = req.body.class;
    var sql = `CALL postFromArray(?, ?, ?, ?)`;
    db.query(sql, [name, classs, subject, college], (err, result) => {
        if(err) return res.send(err);
        return res.send(req.body);
    });
});

//UPDATE BY PASSING ARRAY
router.patch('/array/update', (req, res) => {
    let {id, name, subject, college} = req.body;
    let classs = req.body.class;
    var sql = `CALL updateFromArray(?, ?, ?, ?, ?)`;
    db.query(sql, [id, name, classs, subject, college], (err, result) => {
        if(err) return res.send(err);
        return res.send(req.body);
    });
});

//POST BY PASSING ARRAY OF OBJECTS
router.post('/arrObject/add', (req, res) => {
    let count = 0;
    for(let json of req.body) {
        let sql = `CALL insertStringify('${JSON.stringify(json)}')`;
        db.query(sql, (err, result) => {
            if(err) {
                return res.send(err);
            }
            count++;
            if(count === req.body.length) {
                output(req.body);
            }
        });
    }
    function output(req) {
        return res.send(req);
    }
});

router.patch('/arrObject/update', (req, res) => {
    let outPut = []
    for(let json of req.body) {
        let sql = `CALL updateStringify('${JSON.stringify(json)}')`;
        const result = db.query(sql, (err, result) => {
            console.log(JSON.stringify(json));
            if(err) return res.send(err);
            outPut.push(result)
        });
    }
    return res.send(outPut);

});
//Required Packages
const express = require('express');
const router = express.Router();

//Required Modules
const studentModel = require('../models/studentmodel');
const marksModel = require('../models/marksmodel');
const studentTeacherRelation = require('../models/student-teacher-relation');
const auth = require('../middleware/auth');

//Functions
function hasAuthority(role) {
    return role === 'Teacher';
}

//POST APIs 
router.post('/marks/:id', auth,async (req, res) => {
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    const {error} = marksModel.validateMark({
        student_id : req.params.id,
        exam_id : req.body.exam_id,
        subject_id:req.body.subject_id,
        obtained: req.body.obtained
    });
    if(error) return res.send(error.details[0].message);
    const markToBeUpdated = await marksModel.markmodel({
        student_id : req.params.id,
        exam_id : req.body.exam_id,
        subject_id:req.body.subject_id,
        obtained: req.body.obtained
    })
    markToBeUpdated.save()
    .then((v)=>{
        res.send(v).status(200);
    })
    .catch((err)=>{
        res.send(err.message);
    })
});

//GET APIs
router.get('/mystudents/:id',auth, async (req,res) => {
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    const standard = [];
    const teacher = await studentTeacherRelation.studentTeacherRelationModel.find({
                        teacher_id:req.params.id,
                    });
    for (var i in teacher){
        const students = await studentModel.Student.find({
            std_id : teacher[i].std_id
        })
        .populate('std_id',['std_name'])
        .catch((err)=>{
            res.send(err.message);
        })
        standard.push(students);
    }
    res.send(standard);
});

module.exports = router;
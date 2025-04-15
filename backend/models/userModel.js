import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({

    fname: {
        type: String,
        required: true,
    }, lname: {
        type: String,
        required: true,
    }, email: {
        type: String,
        required: true,
    }, password: {
        type: String,
        required: true,
    },
    role: {
        enum: ["admin", "teacher", "student"], //user == student in our case for now/
    // }, rollNo: {
    //     type: String,
    //     default: undefined
    // }, studentClass: {
    //     type: String,
    //     default: undefined

    // }, studentSection: {/////will be used in case of student
    //     type: String,
    //     default: undefined///commented for now while working on teache
    // }, studentSubject: {
    //     type: String,
    //     default: undefined

    }, teachSubject: {
        type: String,
        default: undefined
    }, teachClass: {
        type: String,
        default: undefined
    }, createdAt: {
        type: Date,
        default: Date.now
    }, updatedAt: {       ////// will be used in case of record/data iupdate 
        type: Date,
        default: undefined
    }

});

const user = mongoose.model('user', userSchema);
export default user;
